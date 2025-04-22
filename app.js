addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const TOKEN = SLACK_BOT_TOKEN;
    const EMOJI = 'thread';

    const requestJson = await request.json();
    const event = requestJson.event;

    if (!event.thread_ts) {
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

    return new Response('', { status: 204 });
}
