
(function (window) {
    "use strict";
    
    var colors = [
        "Red", "Green", "Blue",
        "Yellow", "Cyan", "Magenta",
        "LightRed", "LightGreen", "LightBlue",
        "LightYellow", "LightCyan", "LightMagenta"];
    
    function pad(value) {
        
        while (value.length < 6)
            value = "0" + value;
        
        return value;
    }
    
    function rgbToHex(r, g, b) {
        return "#" + pad((Math.round(r * 255) * 65536 + Math.round(g * 255) * 256 + Math.round(b * 255)).toString(16));
    }
    
    window.Color = {
        Red: function() {
            var r = Math.random() * 0.3 + 0.7,
                g = Math.random() * 0.3 * r,
                b = Math.random() * 0.3 * r;
            
            return rgbToHex(r, g, b);
        },
        Green: function() {
            var g = Math.random() * 0.3 + 0.7,
                r = Math.random() * 0.3 * g,
                b = Math.random() * 0.3 * g;
            
            return rgbToHex(r, g, b);
        },
        Blue: function() {
            var b = Math.random() * 0.3 + 0.7,
                r = Math.random() * 0.3 * b,
                g = Math.random() * 0.3 * b;
            
            return rgbToHex(r, g, b);
        },
        
        Yellow: function() {
            var r = Math.random() * 0.3 + 0.7,
                g = Math.random() * 0.3 + 0.7,
                b = Math.random() * 0.3 * (r + g)/2;
            
            return rgbToHex(r, g, b);
        },
        Cyan: function() {
            var g = Math.random() * 0.3 + 0.7,
                b = Math.random() * 0.3 + 0.7,
                r = Math.random() * 0.3 * (g + b)/2;
            
            return rgbToHex(r, g, b);
        },
        Magenta: function() {
            var r = Math.random() * 0.3 + 0.7,
                b = Math.random() * 0.3 + 0.7,
                g = Math.random() * 0.3 * (r + b)/2;
            
            return rgbToHex(r, g, b);
        },
        
        
        LightRed: function() {
            var r = Math.random() * 0.1 + 0.9,
                g = Math.random() * 0.1 * r + 0.5,
                b = Math.random() * 0.1 * r + 0.5;
            
            return rgbToHex(r, g, b);
        },
        LightGreen: function() {
            var g = Math.random() * 0.1 + 0.9,
                r = Math.random() * 0.1 * g + 0.5,
                b = Math.random() * 0.1 * g + 0.5;
            
            return rgbToHex(r, g, b);
        },
        LightBlue: function() {
            var b = Math.random() * 0.1 + 0.9,
                r = Math.random() * 0.1 * b + 0.5,
                g = Math.random() * 0.1 * b + 0.5;
            
            return rgbToHex(r, g, b);
        },
        
        LightYellow: function() {
            var r = Math.random() * 0.1 + 0.9,
                g = Math.random() * 0.1 + 0.9,
                b = Math.random() * 0.1 * (r + g)/2 + 0.5;
            
            return rgbToHex(r, g, b);
        },
        LightCyan: function() {
            var g = Math.random() * 0.1 + 0.9,
                b = Math.random() * 0.1 + 0.9,
                r = Math.random() * 0.1 * (g + b)/2 + 0.5;
            
            return rgbToHex(r, g, b);
        },
        LightMagenta: function() {
            var r = Math.random() * 0.1 + 0.9,
                b = Math.random() * 0.1 + 0.9,
                g = Math.random() * 0.1 * (r + b)/2 + 0.5;
            
            return rgbToHex(r, g, b);
        },
    };
    
    window.randColor = function() {
        
        var r = Math.floor(Math.random() * colors.length);
        
        return [colors[r], window.Color[colors[r]]()];
        
    };
    
}(window));
