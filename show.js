const fs=require('fs'); const d=JSON.parse(fs.readFileSync('swagger.json')); console.log(d.definitions.OrdersSchema.properties.Orders.items.required);  
