
import express from 'express';
import { getIO } from '../socket.js';

const router = express.Router();

router.post('/emit', async (req, res) => {
    if (
        req.headers['x-internal-key'] !==
        process.env.INTERNAL_SERVICE_KAY
    ) {
        return res.status(403).json({
            msg: "Forbidden"
        });
    }

    const { event, room, payload } = req.body;

    if (!event || !room) {
        return res.status(400).json({
            msg: "event and room are required"
        });
    }

    try {
        const io = getIO();

        // Check sockets in the target room
        const sockets = await io.in(room).fetchSockets();

        console.log("Event:", event);
        console.log("Target room:", room);
        console.log("Sockets in room:", sockets.length);
        console.log(
            "Connected socket IDs:",
            sockets.map(socket => socket.id)
        );

        // Emit event to the room
        io.to(room).emit(event, payload ?? {});

        console.log("Event emitted successfully");

        return res.json({
            success: true,
            room,
            socketsInRoom: sockets.length
        });
    } catch (error) {
        console.error("Emit error:", error);

        return res.status(500).json({
            success: false,
            msg: "Failed to emit event"
        });
    }
});

export default router;
