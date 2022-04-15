function portForward(config, callback) {
    const childProcess = require("child_process");

    const child = childProcess.spawn("kubectl", ["port-forward", `--namespace=${config.namespace}`, `${config.pod_name}`,  `8545:8545`], {detached: true});
    child.stdout.once("data", (data)=>{
        callback(undefined, child);
    })

    child.stderr.on("data", (data)=>{
        callback(data.toString())
    })
}

module.exports = {
    portForward
}