export const mergeClass = (...classList: unknown[]) => {
    return classList.map(entry => typeof entry === 'string' ? entry : '').filter(entry => entry !== '').join(' ');
};