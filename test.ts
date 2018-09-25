function f() {
    switch (returnData.taskType) {
        case WorkerTaskType.COLLIDE:
            let mesh = this._scene.getMeshByUniqueID(returnPayload.collidedMeshUniqueId);
            break;
    }
}