/**!
    Source: https://github.com/nextapps-de/snowflake
    License: Apache License 2.0
    
    Updated by: Andreas Kar <andreas.kar@gmx.at>, 20251211
*/

function Snowflake(config) {

    "use strict";

    let instance = this;
    this.dpi = window.devicePixelRatio || 1;

    this.canvas = document.createElement("canvas");
    this.ctx = instance.canvas.getContext("2d");

    this.imageObj = new Image();
    this.imageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAAGFBMVEXk7PTk7PTk7PTk7PTk7PTk7PQAAADk7PQLtLMUAAAAB3RSTlO18FHbI4YAkU+M0QAAAVVJREFUeF7F1T1PwzAQgGGGouwg5B8QEWaioqyVSsNKoXL2KPYcE6L371PLcp1GjU7A0IztI53Pvo8bK3y/BnkpgGoQAFwXmPvCg/ZZL4A3hg94rPheBOFbBCaCiyHqo9gpAHc44m4Ots6L9h1uC/+/Ws/AE3qapuFrBpo5GCdgX14G+UMAHaxsRjEFLb3dQB0BB0U9BR1uRwS2Acdw/hYVCkYbQJcB4zlogL6OWbQV9OchMhiKlKYBxinYA9omsAW4SyAHWCfQKgagjGADVLgUogGdA6sAdh4bGCMw0PuwOO2BCQlmoBPQ8eAQUzIJdKo8JQunBHN3uodXa8NZAfCRbPg5glnN6eW+2BBy+RtIIQ4JSIcU0xQvSrxq6bHE5xYLRi45uWjlspcbR249uXnl9pcHiDyC0hD7hJc0xMQxKA9SeRTLw1xeB9ffWfJilVfz/7f/D7vzJWHzmXRTAAAAAElFTkSuQmCC";

    this.snowflakes = [];
    this.buffer = [];
    this.flakes = [
        { r: 1.5, o: 0.3 },
        { r: 1.7, o: 0.4 },
        { r: 1.9, o: 0.6 },
        { r: 2.1, o: 0.8 },
        { r: 2.3, o: 1.0 },
        { r: 2.5, o: 1.0 },
        { r: 2.7, o: 0.8 },
        { r: 2.9, o: 0.6 },
        { r: 3.1, o: 0.4 },
        { r: 3.5, o: 0.3 }
    ];

    this.config = {
        id: undefined,
        clazz: "snowflake",
        fill: "#e4ecf4",
        speed: 1,
        size: 3,
        quality: 1.5,
        density: 1,
        mount: 'body',
        autostart: true
    };

    this.width = undefined;
    this.height = undefined;
    this.count = undefined;
    this.raf = 0;
    this.last = 0;

    /**
     * @constructor
     */

    this.Snowflake = function(y) {

        const index = Math.random() * instance.flakes.length | 0;
        const flake = instance.flakes[index];
        const cfg = instance.config;

        this.buffer = instance.buffer[index] || instance.createBuffer(index);
        this.r = flake.r * instance.dpi * cfg.quality;
        this.w = Math.ceil(flake.r * instance.dpi * cfg.quality * cfg.size);
        this.x = instance.randomize(instance.width);
        this.y = y || -this.w;
        this.o = flake.o;
        this.vy = flake.r * flake.r * instance.dpi * cfg.quality / cfg.size / 2;
        this.vx = (0.5 - instance.randomize()) / cfg.size * instance.dpi * cfg.quality;
        this.deg = (1 - instance.randomize(2)) * cfg.size / instance.dpi / cfg.quality / 180 * Math.PI;
    };

    this.createBuffer = function(index) {

        const flake = instance.flakes[index];
        const canvas = instance.buffer[index] = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const cfg = instance.config;
        const img = instance.imageObj;

        const width = Math.ceil(flake.r * instance.dpi * cfg.quality * cfg.size);
        const blur = flake.r < 2.3
            ? (2.3 - flake.r) * 0.9 * instance.dpi * cfg.quality
            : flake.r > 2.3
                ? (flake.r - 2.3) * 1.1 * instance.dpi * cfg.quality
                : 0;

        canvas.height = canvas.width = width;
        ctx.globalAlpha = flake.o;
        ctx.filter = ctx.webkitFilter = "blur(" + blur + "px)";
        ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            0,
            0,
            width,
            width
        );

        ctx.globalAlpha = flake.o / 1.5;
        ctx.fillStyle = cfg.fill;
        ctx.beginPath();
        ctx.arc(
            width / 2,
            width / 2,
            width / 2 / 2,
            0,
            Math.PI * 2,
            false
        );
        ctx.closePath();
        ctx.fill();

        return canvas;
    };

    this.update = function(time) {

        instance.raf = window.requestAnimationFrame(instance.update);
        //setTimeout(update, 1000 / 30, Date.now())
        if (!instance.imageObj.loaded) return;

        const cfg = instance.config;
        let scale = instance.last ? (time - instance.last) / (1000 / 60) : 1;

        instance.ctx.clearRect(0, 0, instance.width, instance.height);

        scale > 100 && (scale = 1);
        instance.last = time;

        for (let i = 0, length = instance.count * cfg.density | 0; i < length; i++) {
            instance.updateFlake(cfg, scale, i, length);
        }
    };

    this.updateFlake = function(cfg, scale, i, length) {
        let flake = instance.snowflakes[i] || (instance.snowflakes[i] = new instance.Snowflake(instance.randomize(instance.height)));

        flake.y += flake.vy * scale * cfg.speed * (cfg.size / 3);
        flake.x += flake.vx * scale * cfg.speed + Math.sin(flake.y / cfg.speed / (cfg.size / 3) * flake.deg) / 2 * instance.dpi * cfg.quality;

        if (flake.y >= instance.height ||
            flake.x >= instance.width ||
            flake.x <= -flake.w) {

            instance.snowflakes.length > length
                ? instance.snowflakes.splice(i--, 1)
                : instance.snowflakes[i] = new instance.Snowflake(0);

        } else {

            instance.ctx.drawImage(
                flake.buffer,
                0,
                0,
                flake.w,
                flake.w,
                flake.x,
                flake.y,
                flake.w,
                flake.w
            );
        }
    };

    this.resize = function() {

        const cfg = instance.config;
        let parent = instance.canvas.parentElement;

        !parent || parent === document.body && (parent = document.documentElement);

        if (parent) {

            instance.width = parent.clientWidth;
            instance.height = parent.clientHeight;

        } else {

            instance.width = window.innerWidth;
            instance.height = window.innerHeight;
        }

        instance.width = instance.width / 3 * instance.dpi * cfg.quality;
        instance.height = instance.height / 3 * instance.dpi * cfg.quality;
        instance.count = ((instance.width / (instance.dpi * cfg.quality)) * (instance.height / (instance.dpi * cfg.quality)) / 1500) | 0;

        instance.canvas.width = instance.width;
        instance.canvas.height = instance.height;
    };

    /**
     * @param {number=} bound
     * @returns {number}
     */

    this.randomize = function(bound) {

        return Math.random() * (bound || 1);
    };

    this.style = function(styles) {

        const style = instance.canvas.style;

        for (const key in styles) {

            style.setProperty(key, styles[key]);
        }
    };

    this.setConfig = function(config) {

        if(config) {

            for(let key in config) {

                key === "start"
                    ? instance.config.autostart = !!config[key]
                  //: key === "stop" ? instance.config.autostart = !config[key]
                    : instance[key](config[key]);
            }
        }
    };

    this.setDefaultStyle = function() {
        instance.style({
            "position": "fixed",
            "top": "0",
            "left": "0",
            "width": "100%",
            "height": "100%",
            "z-index": "999999",
            "pointer-events": "none"
        });
    };

    this.preInit = function() {
        document.readyState === "complete"
            ? instance.init()
            : window.addEventListener("load", instance.init, false);
    };

    this.init = function() {

        const config = window["SnowflakeConfig"];

        instance.setConfig(config);
        instance.imageObj.loaded || instance.imageObj.src || (instance.imageObj.src = instance.imageBase64);
        instance.config.autostart && instance.load();
    };

    this.load = function() {

        const cfg = instance.config;

        instance.update(0);
        cfg.autostart = true;

        if (cfg.clazz)
            instance.canvas.setAttribute("class", cfg.clazz);

        if (cfg.id)
            instance.canvas.setAttribute("id", cfg.id);

        instance.canvas.parentElement || document.querySelector(cfg.mount).appendChild(instance.canvas);
        instance.resize();
    };

    this.bindEvents = function() {

        window.addEventListener("resize", instance.resize, false);

        instance.imageObj.loaded = false;
        instance.imageObj.onload = instance.onImageLoad;
        instance.imageObj.onerror = instance.onImageError;
    };

    this.clazz = function(val) {
        instance.config.clazz = val;
        instance.canvas.setAttribute("class", val);
    };

    this.id = function(val) {
        instance.config.id = val;
        instance.canvas.setAttribute("id", val);
    };

    this.fill = function(val) {
        instance.config.fill = val;
    };

    this.speed = function(val) {
        instance.config.speed = val;
    };

    this.size = function(val) {
        instance.config.size = 3 * val;
        instance.buffer.length = 0;
    };

    this.quality = function(val) {
        instance.config.quality = 3 / 2 * Math.min(Math.max(val, 0.1), 2);
        instance.buffer.length = 0;
        instance.snowflakes.length = 0;
        instance.resize();
    };

    this.density = function(val) {
        instance.config.density = val;
    };

    this.opacity = function(val) {
        instance.style({ "opacity": val });
    };

    this.index = function(val) {
        instance.style({ "z-index": val });
    };

    this.image = function(src) {
        instance.imageObj.loaded = !src;
        src && (instance.imageObj.src = src);
        instance.buffer.length = 0;
    };

    this.mount = function(selector) {
        const node = document.querySelector(selector)

        instance.config.mount = selector;

        if (node !== null) {
            node.appendChild(instance.canvas);
            instance.style({ "position": node === document.body ? "fixed" : "absolute" });
            instance.config.autostart && instance.resize();
        }
    };

    this.start = function() {
        instance.config.autostart
            ? instance.raf || instance.update(0)
            : instance.init() || instance.load();
        instance.style({ "display": "" });
    };

    this.stop = function() {
        cancelAnimationFrame(instance.raf);
        instance.style({ "display": "none" });
        instance.raf = instance.last = 0;
    };

    this.onImageLoad = function() {
        instance.imageObj.loaded = true;
    };

    this.onImageError = function() {
        instance.imageObj.onerror = null;
        instance.imageObj.src =
        instance.imageBase64;
    };

    // bind events
    instance.bindEvents();

    // set defaul style
    instance.setDefaultStyle();

    // apply passed config for instance
    instance.setConfig(config);

    // preinitialization
    instance.preInit();
}