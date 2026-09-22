/**
 * @param {string} data
 */
function f1(data) {
    if (gameData.p4)
        return
    gameData.p4 = true
    gameData.settings.requireShiftForTooltip = true

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    safeUpdateClass(_1xsys[2], "hidden", true)

    const _C1 = true;
    const _C2 = false;
    const _C3 = 1000;
    const _C4 = 700;

    const el17 = elById(_1xsys[1]);
    if (el17) el17.style.pointerEvents = 'none';

    function f4(_2ex, _3ex, _1ex) {
        if (!_2ex || _2ex.style.display === 'none' || _2ex.hasAttribute('hidden')) {
            if (_1ex) _1ex();
            return;
        }
        _2ex.style.transition = `opacity ${_3ex}ms ease`;
        _2ex.style.opacity = '0';
        setTimeout(() => {
            _2ex.style.display = 'none';
            if (_1ex) _1ex();
        }, _3ex);
    }

    function f5(/** @type {() => void} */ _4ex) {
        if (!_C2) {
            _4ex();
            return;
        }

        const styleId = 'frame34-transform-translate';
        if (!elById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                @keyframes frames25 {
                    0% { transform: translate(0, 0); filter: hue-rotate(0deg) skew(0deg); }
                    10% { transform: translate(-4px, 2px); filter: hue-rotate(90deg) skew(-2deg); }
                    20% { transform: translate(3px, -2px); filter: hue-rotate(180deg) skew(3deg); }
                    30% { transform: translate(-2px, -3px); filter: hue-rotate(270deg) skew(0deg); }
                    40% { transform: translate(4px, 3px); filter: hue-rotate(360deg) skew(4deg); }
                    50% { transform: translate(-3px, 1px); filter: hue-rotate(45deg) skew(-3deg); }
                    60% { transform: translate(2px, -4px); filter: invert(0.2); }
                    70% { transform: translate(-4px, -1px); filter: hue-rotate(120deg); }
                    80% { transform: translate(3px, 4px); filter: skew(5deg); }
                    90% { transform: translate(-1px, -2px); filter: hue-rotate(240deg); }
                    100% { transform: translate(0, 0); filter: hue-rotate(0deg) skew(0deg); }
                }
                .som-fer {
                    animation: frames25 0.15s infinite linear !important;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.classList.add('som-fer');

        setTimeout(() => {
            document.body.classList.remove('som-fer');
            const styleElement = elById(styleId);
            if (styleElement) styleElement.remove();
            _4ex();
        }, _C3);
    }

    f5(() => {

        const _19xsys = elById(_1xsys[7]);

        if (_C1 && _19xsys) {
            const _18xsys = /** @type {HTMLElement[]} */ (Array.from(_19xsys.children).filter(child => {
                return child.classList.contains(_1xsys[3]) && !child.classList.contains('hidden');
            }));

            if (_18xsys.length === 0) {
                f4(_19xsys, 500, f8);
                return;
            }

            let _17xsys = _18xsys.length - 1;

            function f6() {
                if (_17xsys < 0) {
                    f4(_19xsys, 0, f8);
                    return;
                }

                const _20xsys = _18xsys[_17xsys];

                _20xsys.click();

                const _21xsys = _20xsys.getAttribute('onClick') || '';
                const _22xsys = _21xsys.match(/setTab\(['"](.+?)['"]\)/);
                const _23xsys = _22xsys ? _22xsys[1] : null;
                const _24xsys = _23xsys ? elById(_23xsys) : null;

                setTimeout(() => {
                    let _15xsys = false;
                    let _16xsys = false;

                    function f7() {
                        if (_15xsys && _16xsys) {
                            _17xsys--;
                            f6();
                        }
                    }

                    f4(_20xsys, 1000, () => {
                        _15xsys = true;
                        f7();
                    });

                    if (_24xsys) {
                        f4(_24xsys, 1000, () => {
                            _16xsys = true;
                            f7();
                        });
                    } else {
                        _16xsys = true;
                        f7();
                    }

                }, _C4);
            }

            f6();

        } else {
            f4(_19xsys, 1500, f8);
        }

        function f8() {
            const _25xsys = elById(_1xsys[4]);
            f4(_25xsys, 0, f9);
        }

        function f9() {
            const _26xsys = elById(_1xsys[5]);
            const _27xsys = elById(_1xsys[6]);

            let _28xsys = false;
            let _29xsys = false;

            function f10() {
                if (_28xsys && _29xsys) {
                    f11(data);
                }
            }

            f4(_26xsys, 1500, () => {
                _28xsys = true;
                f10();
            });

            f4(_27xsys, 1500, () => {
                _29xsys = true;
                f10();
            });

            if (!_27xsys || _27xsys.hasAttribute('hidden') || _27xsys.style.display === 'none') {
                _29xsys = true;
                f10();
            }
        }
    });
}

const _67xsys = 67

/**
 * 
 * @param {string} data 
 */
async function f11(data) {
    document.body.style.transition = 'background-color 3000ms ease, background 3000ms ease';
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#000000';

    const errorElement = document.createElement('div');
    errorElement.id = 'errorElement';

    Object.assign(errorElement.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        maxWidth: '600px',
        width: '90%',
        zIndex: '100000',
        fontSize: '14px',
        lineHeight: '1.8',
        opacity: '0',
        transition: 'opacity 2500ms ease'
    });

    errorElement.innerHTML = f12(data, _67xsys);
    document.body.appendChild(errorElement);
    setTimeout(() => {
        errorElement.style.opacity = '1';
    }, 100);
}
