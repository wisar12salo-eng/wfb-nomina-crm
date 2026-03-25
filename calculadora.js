const readline = require('readline');
const fs = require('fs'); // <--- NUEVA HERRAMIENTA PARA ARCHIVOS

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SMMLV = 1300000; 
const VALOR_AUX_TRANSPORTE = 162000; 

console.log("=== REGISTRO DE NÓMINA WFB ===");

rl.question("Nombre del empleado: ", (nombre) => {
    rl.question("Salario base: ", (salarioBaseStr) => {
        
        const salarioBase = parseFloat(salarioBaseStr);
        const diasTrabajados = 30;
        let auxilioTransporte = (salarioBase <= (SMMLV * 2)) ? (VALOR_AUX_TRANSPORTE / 30) * diasTrabajados : 0;
        
        const salud = (salarioBase / 30 * diasTrabajados) * 0.04;
        const pension = (salarioBase / 30 * diasTrabajados) * 0.04;
        const neto = salarioBase + auxilioTransporte - salud - pension;

        // --- 📦 CREAMOS EL OBJETO DE DATOS ---
        const nuevoRegistro = {
            fecha: new Date().toLocaleDateString(),
            empleado: nombre,
            salario: salarioBase,
            auxilio: auxilioTransporte,
            deducciones: salud + pension,
            totalNeto: neto
        };

        // --- 💾 GUARDAR EN "BASE DE DATOS" (archivo JSON) ---
        // Leemos lo que ya existe, sumamos lo nuevo y guardamos
        let historial = [];
        if (fs.existsSync('nominas.json')) {
            const contenido = fs.readFileSync('nominas.json');
            historial = JSON.parse(contenido);
        }
        
        historial.push(nuevoRegistro);
        fs.writeFileSync('nominas.json', JSON.stringify(historial, null, 2));

        console.log("\n✅ ¡Nómina procesada y GUARDADA en el historial!");
        console.log(`Total a pagar a ${nombre}: $${neto.toLocaleString()}`);

        rl.close();
    });
});