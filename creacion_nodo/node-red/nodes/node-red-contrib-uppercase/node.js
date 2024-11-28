module.exports = function(RED) {
    function UppercaseNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        node.on('input', function(msg) {
            if (typeof msg.payload === 'string') {
                msg.payload = msg.payload.toUpperCase(); // Convierte el payload a mayúsculas
            } else {
                node.error("El payload no es una cadena de texto", msg);
            }
            node.send(msg);
        });
    }
    
    RED.nodes.registerType("uppercase", UppercaseNode);
};
