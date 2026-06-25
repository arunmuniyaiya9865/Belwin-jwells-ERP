async function test() {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/loans/LOAN000005');
        const data = await res.json();
        console.log("Success! Data:");
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}
test();
