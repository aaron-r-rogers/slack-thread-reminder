addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const TOKEN = SLACK_BOT_TOKEN;
    const EMOJI = 'thread';
    const REMINDER_TIME_LIMIT = 30;

    const requestJson = await request.json();
    const event = requestJson.event;

    if (requestJson.type === 'url_verification') {
        return new Response(requestJson.challenge);
    }

    let lastMessageTimestamp = await getLastMessageTimestamp(event.channel, event.user);

    if (lastMessageTimestamp) {
        const timeDiff = (parseFloat(event.ts) - parseFloat(lastMessageTimestamp));

        if (timeDiff <= REMINDER_TIME_LIMIT) {
            await fetch('https://slack.com/api/reactions.add', {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    timestamp: event.ts,
                    channel: event.channel,
                    name: EMOJI,
                }),
            });
        }
    }

    await storeLastMessageTimestamp(event.channel, event.user, event.ts);

    return new Response('', { status: 204 });
}

let messageStorage = {};

async function getLastMessageTimestamp(channel, user) {
    const key = `${channel}:${user}`;
    return messageStorage[key] || null;
}

async function storeLastMessageTimestamp(channel, user, timestamp) {
    const key = `${channel}:${user}`;
    messageStorage[key] = timestamp;

    setTimeout(() => {
        delete messageStorage[key];
    }, 1800000);
}
