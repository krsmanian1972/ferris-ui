import { TextGeometry, Font, MeshBasicMaterial, Mesh } from 'three';

const font_regular = new Font(require('./fonts/helvetiker_regular.typeface.json'));
//const font_bold = new Font(require('./fonts/helvetiker_bold.typeface.json'));

export default class TextFactory {
  
    build = (text, size, height, color) => {
        const material = new MeshBasicMaterial({ color: color });
        const textGeo = new TextGeometry(text, { font: font_regular, size: size, height: height, bevelEnabled: false, bevelSize: 0 });
        return new Mesh(textGeo, material);
    }
}