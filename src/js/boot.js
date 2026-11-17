/* ---------------- BOOT ---------------- */
let savedInd = null;
try { savedInd = localStorage.getItem('auditos.industry'); } catch (e) { /* storage unavailable */ }
applyDataset(savedInd || 'crypto');
load();
let savedUser = null;
try { savedUser = localStorage.getItem('auditos.user'); } catch (e) { /* storage unavailable */ }
setUser(savedUser || 'mgr');
renderShell();
window.addEventListener('hashchange', () => { render(); $('#main').scrollTop = 0; $('#main').focus({ preventScroll: true }); });
render();
