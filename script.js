let isSubmitting = false;
let cooldownInterval;
const cooldownDuration = 3600; 
const localStorageKey = "lastTicketSubmission";


function getLastSubmissionTime() {
    return parseInt(localStorage.getItem(localStorageKey) || "0", 10);
}


function setLastSubmissionTime(timestamp) {
    localStorage.setItem(localStorageKey, timestamp.toString());
}

function createTicket() {
    if (isSubmitting) {
        return;
    }

    const currentTime = Date.now();
    const lastSubmissionTime = getLastSubmissionTime();
    const timeSinceLastSubmission = currentTime - lastSubmissionTime;

    if (timeSinceLastSubmission < cooldownDuration * 1000) {
        const remainingCooldown = Math.ceil((cooldownDuration * 1000 - timeSinceLastSubmission) / 1000);
        displayStatus(`Подождите ещё ${remainingCooldown} секунд до следующей отправки.`, "error");
        return;
    }


    const ticketTitle = document.getElementById("ticketTitle").value;
    const ticketDescription = document.getElementById("ticketDescription").value;


    if (!ticketTitle || !ticketDescription) {
        displayStatus("Заголовок и описание тикета обязательны. ", "error" );
        return;
    }


    isSubmitting = true;
    setLastSubmissionTime(currentTime);
    startCooldownTimer();

  
    getIpAddress(ticketTitle, ticketDescription);
}

function getIpAddress(title, description) {

    fetch('https://httpbin.org/ip')
        .then(response => response.json())
        .then(data => {
            const userIpAddress = data.origin || 'undefined';

            sendTicketToDiscord(title, description, userIpAddress);
        })
        .catch(error => {
            console.error('Произошла ошибка при получении информации о IP-адресе:', error);
            const userIpAddress = 'Не удалось получить информацию о IP-адресе';

            sendTicketToDiscord(title, description, userIpAddress);
        });
}

function sendTicketToDiscord(title, description, userIpAddress) {
    const webhookURL = 'https://discordapp.com/api/webhooks/1153309592122556446/yyx9AwOejgstDdZvGNQDWfdNYJo2BfatjZpCoZDJr3_Wxo2ZDjq6j3A2dDlZcVaEhhNc';

    const data = {
        embeds: [
            {
                title: ':ticket: **Новый тикет** :ticket:',
                color: 0x00ff96, 
                fields: [
                    {
                        name: 'Заголовок',
                        value: title
                    },
                    {
                        name: 'Описание',
                        value: description
                    },
                    {
                        name: 'Данные об IP',
                        value: userIpAddress || 'Не удалось получить IP-адрес'
                    }
                ]
            }
        ]
    };

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                displayStatus("Тикет успешно отправлен на Discord. ", "success");
            } else {
                displayStatus("Произошла ошибка при отправке тикета на Discord. ", "error");
            }
            isSubmitting = false;
        })
        .catch(error => {
            console.error('Произошла ошибка:', error);
            displayStatus("Произошла ошибка при отправке тикета на Discord. :x:", "error");
            isSubmitting = false;
        });
}

function displayStatus(message, type = "") {
    const statusElement = document.getElementById("status");
    statusElement.textContent = message;
    statusElement.className = type;
}

function startCooldownTimer() {
    const cooldownTimerElement = document.getElementById("cooldownTimer");
    let countdown = cooldownDuration;

    cooldownInterval = setInterval(() => {
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;

        cooldownTimerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        if (countdown === 0) {
            clearInterval(cooldownInterval);
            cooldownTimerElement.textContent = "";
            isSubmitting = false;
        }

        countdown--;
    }, 1000);
}


function openDetailsModal() {
    const modal = document.getElementById("detailsModal");
    modal.style.display = "block";
}


function closeDetailsModal() {
    const modal = document.getElementById("detailsModal");
    modal.style.display = "none";
}
