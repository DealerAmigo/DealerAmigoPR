const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
console.log("URL:", webhookUrl);
if (webhookUrl) {
  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "Timestamp": new Date().toISOString(),
      "Lead ID": "TEST-123",
      "Nombre": "Prueba GAS",
      "Telefono": "787-000-0000"
    })
  }).then(res => {
    console.log("Status:", res.status);
    return res.text();
  }).then(text => console.log("Response:", text))
  .catch(err => console.error("Error:", err));
}
