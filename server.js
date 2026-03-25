const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'wfb_nomina_secret_2026';

// 1. MIDDLEWARE
app.use(express.json());
app.use(express.static(__dirname));

// 2. CONFIGURAR MULTER PARA SUBIDA DE ARCHIVOS
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname.replace(/\s/g, '_'));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
app.use('/uploads', express.static('./uploads'));

// 3. CONEXIÓN A LA BASE DE DATOS
const db = new sqlite3.Database('./wfb_database.db', (err) => {
    if (err) console.error("❌ Error al conectar DB:", err.message);
    else console.log("✅ Conectado a la Base de Datos SQLite (WFB-PRO).");
});

// 4. CREACIÓN DE TABLAS
db.run(`CREATE TABLE IF NOT EXISTS nominas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empleado_id INTEGER,
    comprobanteNo TEXT, 
    empleado TEXT, 
    identificacion TEXT,
    cargo TEXT, 
    periodo TEXT, 
    salarioContrato REAL, 
    dias INTEGER,
    sueldoDevengado REAL, 
    auxTransporte REAL, 
    salud REAL,
    pension REAL, 
    totalNeto REAL, 
    fechaProceso TEXT,
    estado_pago TEXT DEFAULT 'pendiente',
    fecha_pago TEXT,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL, usuario TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, rol TEXT NOT NULL DEFAULT 'rrhh',
    activo INTEGER DEFAULT 1, fechaCreacion TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS empleados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    cedula TEXT UNIQUE NOT NULL,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    ciudad TEXT,
    fechaNacimiento TEXT,
    cargo TEXT,
    salario REAL,
    fechaIngreso TEXT,
    tipoContrato TEXT,
    banco TEXT,
    tipoCuenta TEXT,
    numeroCuenta TEXT,
    foto TEXT,
    contrato TEXT,
    estado TEXT DEFAULT 'activo',
    fechaCreacion TEXT
)`);

// 5. CREAR USUARIO ADMIN POR DEFECTO
db.get("SELECT * FROM usuarios WHERE usuario = 'admin'", [], async (err, row) => {
    if (!row) {
        const hash = await bcrypt.hash('admin123', 10);
        db.run(`INSERT INTO usuarios (nombre, usuario, password, rol, fechaCreacion) VALUES (?, ?, ?, ?, ?)`,
            ['Administrador', 'admin', hash, 'admin', new Date().toLocaleDateString('es-CO')],
            () => console.log("✅ Usuario admin creado. Usuario: admin | Contraseña: admin123")
        );
    }
});

// 6. MIDDLEWARE DE AUTENTICACIÓN
function verificarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado.' });
    try {
        req.usuario = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido.' });
    }
}

function soloAdmin(req, res, next) {
    if (req.usuario.rol !== 'admin') return res.status(403).json({ error: 'Solo administradores.' });
    next();
}

// 7. RUTAS DE AUTENTICACIÓN
app.post('/api/login', async (req, res) => {
    const { usuario, password } = req.body;
    db.get("SELECT * FROM usuarios WHERE usuario = ? AND activo = 1", [usuario], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
        const valido = await bcrypt.compare(password, user.password);
        if (!valido) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
        const token = jwt.sign(
            { id: user.id, nombre: user.nombre, usuario: user.usuario, rol: user.rol },
            JWT_SECRET, { expiresIn: '8h' }
        );
        res.json({ success: true, token, nombre: user.nombre, rol: user.rol });
    });
});

// 8. RUTAS DE EMPLEADOS
app.get('/api/empleados', verificarToken, (req, res) => {
    db.all("SELECT * FROM empleados ORDER BY nombre ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/empleados', verificarToken, upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'contrato', maxCount: 1 }
]), (req, res) => {
    const d = req.body;
    const foto = req.files?.foto?.[0]?.filename || null;
    const contrato = req.files?.contrato?.[0]?.filename || null;

    const sql = `INSERT INTO empleados (nombre, cedula, telefono, email, direccion, ciudad, fechaNacimiento, cargo, salario, fechaIngreso, tipoContrato, banco, tipoCuenta, numeroCuenta, foto, contrato, fechaCreacion)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        d.nombre?.toUpperCase(), d.cedula, d.telefono, d.email,
        d.direccion, d.ciudad, d.fechaNacimiento, d.cargo?.toUpperCase(),
        parseFloat(d.salario), d.fechaIngreso, d.tipoContrato,
        d.banco, d.tipoCuenta, d.numeroCuenta, foto, contrato,
        new Date().toLocaleDateString('es-CO')
    ];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        console.log("✅ Empleado creado:", d.nombre);
        res.json({ success: true, id: this.lastID });
    });
});

app.put('/api/empleados/:id', verificarToken, upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'contrato', maxCount: 1 }
]), (req, res) => {
    const d = req.body;
    const foto = req.files?.foto?.[0]?.filename || d.fotoActual || null;
    const contrato = req.files?.contrato?.[0]?.filename || d.contratoActual || null;

    const sql = `UPDATE empleados SET nombre=?, cedula=?, telefono=?, email=?, direccion=?, ciudad=?, fechaNacimiento=?, cargo=?, salario=?, fechaIngreso=?, tipoContrato=?, banco=?, tipoCuenta=?, numeroCuenta=?, foto=?, contrato=? WHERE id=?`;
    const params = [
        d.nombre?.toUpperCase(), d.cedula, d.telefono, d.email,
        d.direccion, d.ciudad, d.fechaNacimiento, d.cargo?.toUpperCase(),
        parseFloat(d.salario), d.fechaIngreso, d.tipoContrato,
        d.banco, d.tipoCuenta, d.numeroCuenta, foto, contrato, req.params.id
    ];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/empleados/:id', verificarToken, (req, res) => {
    db.run("UPDATE empleados SET estado = 'inactivo' WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 9. RUTAS DE USUARIOS
app.get('/api/usuarios', verificarToken, soloAdmin, (req, res) => {
    db.all("SELECT id, nombre, usuario, rol, activo, fechaCreacion FROM usuarios", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/usuarios', verificarToken, soloAdmin, async (req, res) => {
    const { nombre, usuario, password, rol } = req.body;
    const hash = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO usuarios (nombre, usuario, password, rol, fechaCreacion) VALUES (?, ?, ?, ?, ?)`,
        [nombre, usuario, hash, rol, new Date().toLocaleDateString('es-CO')],
        function(err) {
            if (err) return res.status(500).json({ error: 'Usuario ya existe.' });
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.delete('/api/usuarios/:id', verificarToken, soloAdmin, (req, res) => {
    if (req.params.id == req.usuario.id) return res.status(400).json({ error: 'No puedes eliminarte.' });
    db.run("UPDATE usuarios SET activo = 0 WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 10. RUTA EXPORTAR EXCEL (CONSOLIDADO CON JOIN)
app.get('/api/exportar', verificarToken, (req, res) => {
    const sqlNominas = `
        SELECT 
            n.comprobanteNo, 
            e.nombre as empleado, 
            e.cedula as identificacion, 
            e.cargo, 
            n.periodo, 
            e.salario as salarioContrato, 
            n.dias, 
            n.sueldoDevengado, 
            n.auxTransporte, 
            n.salud, 
            n.pension, 
            n.totalNeto, 
            n.fechaProceso
        FROM nominas n
        INNER JOIN empleados e ON n.empleado_id = e.id
        ORDER BY n.id DESC
    `;

    db.all(sqlNominas, [], (err, nominas) => {
        if (err) return res.status(500).send("Error en la base de datos: " + err.message);

        const sqlEmpleados = `SELECT id, nombre, cedula, cargo, salario, banco, tipoCuenta, numeroCuenta, estado FROM empleados ORDER BY nombre ASC`;
        db.all(sqlEmpleados, [], (err2, empleados) => {
            if (err2) return res.status(500).send("Error en la base de datos: " + err2.message);

            try {
                const wb = XLSX.utils.book_new();
                const dataNominas = nominas.length > 0 ? nominas : [{ Mensaje: "No hay nóminas registradas" }];
                const wsNominas = XLSX.utils.json_to_sheet(dataNominas);
                XLSX.utils.book_append_sheet(wb, wsNominas, "Nominas_WFB");

                const dataEmpleados = empleados.length > 0 ? empleados : [{ Mensaje: "No hay empleados registrados" }];
                const wsEmpleados = XLSX.utils.json_to_sheet(dataEmpleados);
                XLSX.utils.book_append_sheet(wb, wsEmpleados, "Empleados_WFB");

                const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=WFB_REPORTE_NOMINA.xlsx');
                res.setHeader('Content-Length', buffer.length);
                res.status(200).send(buffer);
            } catch (e) {
                console.error(e);
                res.status(500).send("Error al generar el archivo");
            }
        });
    });
});

// RUTA RESUMEN CONTABILIDAD POR EMPLEADO (CRUCE empleados.cedula = nominas.identificacion)
app.get('/api/contabilidad/resumen', verificarToken, (req, res) => {
    const sql = `
        SELECT
            e.id,
            e.nombre,
            e.cedula,
            e.cargo,
            e.salario AS salarioContrato,
            COUNT(n.id) AS nominasLiquidadas,
            COALESCE(SUM(n.sueldoDevengado), 0) AS totalSueldoDevengado,
            COALESCE(SUM(n.auxTransporte), 0) AS totalAuxTransporte,
            COALESCE(SUM(n.salud), 0) AS totalSalud,
            COALESCE(SUM(n.pension), 0) AS totalPension,
            COALESCE(SUM(n.totalNeto), 0) AS totalNeto
        FROM empleados e
        LEFT JOIN nominas n ON e.cedula = n.identificacion
        GROUP BY e.id
        ORDER BY e.nombre ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// RUTA REPORTE DE PAGOS (estado de pagos por empleado)
app.get('/api/pagos/reporte', verificarToken, (req, res) => {
    const sql = `
        SELECT
            e.id,
            e.nombre,
            e.cedula,
            e.cargo,
            COUNT(CASE WHEN n.estado_pago = 'pagada' THEN 1 END) AS nominasPagadas,
            COUNT(CASE WHEN n.estado_pago = 'pendiente' THEN 1 END) AS nominasPendientes,
            COALESCE(SUM(CASE WHEN n.estado_pago = 'pagada' THEN n.totalNeto ELSE 0 END), 0) AS totalPagado,
            COALESCE(SUM(CASE WHEN n.estado_pago = 'pendiente' THEN n.totalNeto ELSE 0 END), 0) AS totalPendiente
        FROM empleados e
        LEFT JOIN nominas n ON e.cedula = n.identificacion
        GROUP BY e.id
        ORDER BY e.nombre ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// RUTA EXPORTAR REPORTE DE PAGOS A EXCEL
app.get('/api/pagos/exportar', verificarToken, (req, res) => {
    const sql = `
        SELECT
            e.nombre,
            e.cedula,
            e.cargo,
            COUNT(CASE WHEN n.estado_pago = 'pagada' THEN 1 END) AS nominasPagadas,
            COUNT(CASE WHEN n.estado_pago = 'pendiente' THEN 1 END) AS nominasPendientes,
            COALESCE(SUM(CASE WHEN n.estado_pago = 'pagada' THEN n.totalNeto ELSE 0 END), 0) AS totalPagado,
            COALESCE(SUM(CASE WHEN n.estado_pago = 'pendiente' THEN n.totalNeto ELSE 0 END), 0) AS totalPendiente
        FROM empleados e
        LEFT JOIN nominas n ON e.cedula = n.identificacion
        GROUP BY e.id
        ORDER BY e.nombre ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).send("Error: " + err.message);
        try {
            const wb = XLSX.utils.book_new();
            const data = rows.length > 0 ? rows : [{ Mensaje: "Sin datos de pagos" }];
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, "Reporte_Pagos");
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=WFB_REPORTE_PAGOS.xlsx');
            res.status(200).send(buffer);
        } catch (e) {
            res.status(500).send("Error al generar archivo");
        }
    });
});

// 11. RUTAS DE NÓMINAS
app.get('/api/nominas', verificarToken, (req, res) => {
    const sql = `
        SELECT n.*, e.nombre, e.cedula, e.cargo, e.salario
        FROM nominas n
        INNER JOIN empleados e ON n.empleado_id = e.id
        ORDER BY n.id DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/nominas', verificarToken, (req, res) => {
    const { empleado_id, dias, periodo } = req.body;
    
    // 1. Buscar datos del empleado en el Maestro
    db.get("SELECT * FROM empleados WHERE id = ?", [empleado_id], (err, empleado) => {
        if (err || !empleado) return res.status(404).json({ error: "Empleado no encontrado en el Maestro." });

        const base = parseFloat(empleado.salario);
        const d = parseInt(dias);
        const sueldoDevengado = Math.round((base / 30) * d);
        const auxTransporte = base <= (1750905 * 2) ? Math.round((249095 / 30) * d) : 0;
        const salud = Math.round(sueldoDevengado * 0.04);
        const pension = Math.round(sueldoDevengado * 0.04);
        const totalNeto = (sueldoDevengado + auxTransporte) - (salud + pension);

        db.get("SELECT MAX(id) as ultimoId FROM nominas", [], (err, row) => {
            if (err) return res.status(500).send(err.message);
            const numComprobante = "WFB-" + String((row.ultimoId || 0) + 1).padStart(3, '0');
            
            const sql = `INSERT INTO nominas (
                empleado_id, comprobanteNo, empleado, identificacion, cargo, periodo, 
                salarioContrato, dias, sueldoDevengado, auxTransporte, salud, pension, 
                totalNeto, fechaProceso
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const params = [
                empleado_id, numComprobante, empleado.nombre, empleado.cedula, 
                empleado.cargo, periodo, base, d, sueldoDevengado, auxTransporte, 
                salud, pension, totalNeto, new Date().toLocaleDateString('es-CO')
            ];

            db.run(sql, params, function(err) {
                if (err) return res.status(500).send(err.message);
                res.json({ success: true, id: this.lastID, comprobante: numComprobante });
            });
        });
    });
});

// RUTA MARCAR NÓMINA COMO PAGADA
app.put('/api/nominas/:id/pago', verificarToken, (req, res) => {
    const { estado_pago } = req.body;
    if (!['pendiente', 'pagada'].includes(estado_pago)) {
        return res.status(400).json({ error: 'Estado inválido. Use: pendiente o pagada' });
    }
    
    const fecha_pago = estado_pago === 'pagada' ? new Date().toLocaleDateString('es-CO') : null;
    const sql = `UPDATE nominas SET estado_pago = ?, fecha_pago = ? WHERE id = ?`;
    db.run(sql, [estado_pago, fecha_pago, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, estado_pago, fecha_pago });
    });
});

app.delete('/api/nominas/:id', verificarToken, (req, res) => {
    db.run("DELETE FROM nominas WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 12. INICIO
app.listen(PORT, () => {
    console.log("==========================================");
    console.log("🚀 WFB NÓMINA PRO *² ACTIVA");
    console.log("🔐 Login | 👥 Empleados | 📊 Nómina");
    console.log("📍 Acceso: http://localhost:" + PORT);
    console.log("==========================================");
});