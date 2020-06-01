export const transport = {
    move_speed: 30,
    collect_speed: 15,
    moveBackwards: store => {
        store.transport.position--;
        store.transport.work += transport.move_speed;
        if (store.transport.position === -1) store.transport.task = "idle";
        return store;
    }
};
