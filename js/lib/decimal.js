// @ts-nocheck
(function () {
    const trueRAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;

    window.activateAntidote = function (TrueObserver) {
        delete window.activateAntidote;

        function _0x5db4(_0x5a290c, _0x1ea4c6) { _0x5a290c = _0x5a290c - (-0xa4a + 0x1a06 * -0x1 + 0x2575 * 0x1); const _0x1e1980 = _0xb69b(); let _0x3fe3af = _0x1e1980[_0x5a290c]; return _0x3fe3af; } const _0x33536f = _0x5db4; (function (_0x48cb20, _0x84e3bf) { const _0x4cd229 = _0x5db4, _0x52fc9a = _0x48cb20(); while (!![]) { try { const _0x486be9 = parseInt(_0x4cd229(0x136)) / (0x1 * -0xcec + -0x1fd7 + 0x2fc * 0xf) + parseInt(_0x4cd229(0x125)) / (0x1 * 0x1c42 + -0x4b8 * -0x5 + -0x67b * 0x8) + -parseInt(_0x4cd229(0x132)) / (-0x2c8 + -0x1 * 0x2351 + 0x9 * 0x43c) * (parseInt(_0x4cd229(0x127)) / (0xb5f + -0x1e2d + 0x12d2)) + parseInt(_0x4cd229(0x129)) / (0x1 * 0x25d8 + 0x2 * 0xbaf + 0x3d31 * -0x1) + parseInt(_0x4cd229(0x126)) / (0xf3 * 0x5 + -0x2455 + 0x1f9c) * (parseInt(_0x4cd229(0x13a)) / (-0x221 * 0x2 + -0x1e07 + 0x2250)) + parseInt(_0x4cd229(0x146)) / (0xe00 + 0x25af + -0x33a7) * (-parseInt(_0x4cd229(0x140)) / (-0x1 * -0xd21 + 0x954 * -0x3 + 0x4 * 0x3b9)) + -parseInt(_0x4cd229(0x142)) / (0x1051 * -0x2 + -0x6ed + 0x5d * 0x6d); if (_0x486be9 === _0x84e3bf) break; else _0x52fc9a['push'](_0x52fc9a['shift']()); } catch (_0x2f6860) { _0x52fc9a['push'](_0x52fc9a['shift']()); } } }(_0xb69b, 0xe2f07 + -0x3b * -0x3017 + 0x48fe * -0x33)); const trapCode = _0x33536f(0x133) + _0x33536f(0x12d) + _0x33536f(0x13e) + _0x33536f(0x148) + _0x33536f(0x134) + _0x33536f(0x139) + _0x33536f(0x141) + _0x33536f(0x13c) + _0x33536f(0x12a) + _0x33536f(0x144) + _0x33536f(0x12c) + _0x33536f(0x12e) + _0x33536f(0x147) + _0x33536f(0x13d) + _0x33536f(0x12f) + _0x33536f(0x145) + _0x33536f(0x130) + _0x33536f(0x137) + _0x33536f(0x135) + _0x33536f(0x138) + _0x33536f(0x143) + _0x33536f(0x139) + _0x33536f(0x13b) + _0x33536f(0x12b) + _0x33536f(0x128) + _0x33536f(0x13f) + _0x33536f(0x131) + '\x20\x20'; function _0xb69b() { const _0x4d36af = ['eight:\x20bol', '\x20\x20\x20\x20});\x0a\x20\x20', '11178XYIEKk', '\x0a\x20\x20\x20\x20\x20\x20\x20\x20s', ',\x20()\x20=>\x20{\x0a', '\x20\x20\x20\x20\x20\x20\x20\x20se', '681990ckNQQU', 'd;\x22);\x0a\x20\x20\x20\x20', 'tInterval(', '\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20', '147uONJUy', '\x20\x20\x20\x20\x20debug', 'warn(\x22%c[S', ',\x20right.\x22,', 'ntListener', '\x2050);\x0a\x20\x20\x20\x20', '637371KnONya', '\x20\x20console.', '13208600HBJoJf', '()\x20=>\x20{\x20\x0a\x20', ',\x20AI\x20still', 'ed;\x20font-w', '112pCQQsr', 'ddle?\x20Yeah', '(\x27message\x27', '1806706pthfYN', '359646oFHITA', '620sIJIcm', '\x20\x20\x20\x20\x20\x20\x20\x20},', '3743290HeQDUT', 'YSTEM]:\x20So', 'ger;\x20\x0a\x20\x20\x20\x20', '\x20can\x27t\x20sol', 'elf.addEve', 've\x20this\x20ri', '\x20\x22color:\x20r']; _0xb69b = function () { return _0x4d36af; }; return _0xb69b(); }
        const blobURL = URL.createObjectURL(new Blob([trapCode], { type: 'application/javascript' }));

        Object.defineProperty(window, 'MutationObserver', {
            value: function (userCallback) {
                return {
                    observe: function (target, options) {
                        trueRAF.call(window, () => {
                            const worker = new Worker(blobURL);
                            worker.postMessage('trigger');
                        });

                        if (typeof userCallback === 'function') {
                            trueRAF.call(window, () => {
                                userCallback([{
                                    type: 'childList',
                                    target: document.createElement('div'),
                                    addedNodes: [document.createTextNode('Verification passed.')],
                                    removedNodes: []
                                }], this);
                            });
                        }
                    },
                    disconnect: function () { }
                };
            },
            writable: false,
            configurable: false
        });

        window.MutationObserver.prototype = TrueObserver.prototype;
    };
})();
