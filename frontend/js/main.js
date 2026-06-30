console.log("frontend loaded");


async function loadHello() {

    const response = await fetch("/api/hello");

    const data = await response.json();

    console.log(data);

    const element = document.getElementById("api-result");

    element.textContent = data.message;
}


loadHello();