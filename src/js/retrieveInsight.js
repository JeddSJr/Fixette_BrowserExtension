async function retrieveInsight(parameters) {
    try {
        for (const parameter of parameters) {
            const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(parameter)}`);
            const data = await response.json();
            
            // Process the retrieved data here
            console.log(data);
        }
    } catch (error) {
        console.error(error);
    }
}