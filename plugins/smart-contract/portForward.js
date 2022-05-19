function portForward(config, callback) {
    const childProcess = require("child_process");

    if (typeof config.namespace === "undefined") {
        config.namespace = "default";
    }
    const child = childProcess.spawn("kubectl", ["port-forward", `--namespace=${config.namespace}`, `deployment/${config.fullnameOverride}`,  `8545:8545`], {detached: true});
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