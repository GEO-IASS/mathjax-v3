/*************************************************************
 *
 *  Copyright (c) 2017 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * @fileoverview  Implements the CHTMLmsqrt wrapper for the MmlMsqrt object
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {CHTMLWrapper} from '../Wrapper.js';
import {CHTMLWrapperFactory} from '../WrapperFactory.js';
import {CHTMLmo} from './mo.js';
import {BBox} from '../BBox.js';
import {MmlMsqrt} from '../../../core/MmlTree/MmlNodes/msqrt.js';
import {MmlNode, AbstractMmlNode, TextNode, AttributeList} from '../../../core/MmlTree/MmlNode.js';
import {StyleList} from '../CssStyles.js';
import {DIRECTION} from '../FontData.js';

/*****************************************************************/
/*
 *  The CHTMLmsqrt wrapper for the MmlMsqrt object
 */

export class CHTMLmsqrt extends CHTMLWrapper {
    public static kind = MmlMsqrt.prototype.kind;

    public static styles: StyleList = {
        'mjx-root': {
            display: 'inline-block',
            'white-space': 'nowrap'
        },
        'mjx-surd': {
            display: 'inline-block',
            'vertical-align': 'top'
        },
        'mjx-sqrt': {
            display: 'inline-block',
            'padding-top': '.07em'
        },
        'mjx-sqrt > mjx-box': {
            'border-top': '.07em solid'
        }
    };

    /*
     * @return{number}  The index of the base of the root in childNodes
     */
    get base() {
        return 0;
    }

    /*
     * @return{number}  The index of the surd in childNodes
     */
    get surd() {
        return 1;
    }

    /*
     * @return{number}  The index of the root in childNodes (or null if none)
     */
    get root(): number {
        return null;
    }

    /*
     * The requested height of the stretched surd character
     */
    protected surdH: number;

    /*
     * Add the surd character so we can display it later
     *
     * @override
     */
    constructor(factory: CHTMLWrapperFactory, node: MmlNode, parent: CHTMLWrapper = null) {
        super(factory, node, parent);
        const surd = this.createMo('\u221A');
        surd.canStretch(DIRECTION.Vertical);
        const {h, d} = this.childNodes[this.base].getBBox();
        const t = this.font.params.rule_thickness;
        const p = (this.node.attributes.get('displaystyle') ? this.font.params.x_height : t);
        this.surdH = h + d + 2 * t + p / 4;
        surd.getStretchedVariant([this.surdH - d, d], true);
    }

    /*
     * Create an mo wrapper with the given text,
     *   link it in, and give it the right defaults.
     *
     * @param{string} text  The text for the wrapped element
     * @return{CHTMLWrapper}  The wrapped MmlMo node
     */
    protected createMo(text: string) {
        const mmlFactory = (this.node as AbstractMmlNode).factory;
        const textNode = (mmlFactory.create('text') as TextNode).setText(text);
        const mml = mmlFactory.create('mo', {stretchy: true}, [textNode]);
        const attributes = this.node.attributes;
        const display = attributes.get('display') as boolean;
        const scriptlevel = attributes.get('scriptlevel') as number;
        const defaults: AttributeList = {
            mathsize: ['math', attributes.get('mathsize')]
        };
        mml.setInheritedAttributes(defaults, display, scriptlevel, false);
        const node = this.wrap(mml) as CHTMLmo;
        node.parent = this;
        this.childNodes.push(node);
        return node;
    }

    /*
     * @override
     */
    public toCHTML(parent: HTMLElement) {
        const surd = this.childNodes[this.surd];
        const base = this.childNodes[this.base];
        //
        //  Get the parameters for the spacing of the parts
        //
        const sbox = surd.getBBox();
        const bbox = base.getBBox();
        const [p, q] = this.getPQ(sbox);
        //
        //  Create the HTML structure for the root
        //
        const CHTML = this.standardCHTMLnode(parent);
        let SURD, BASE, ROOT, root;
        if (this.root != null) {
            ROOT = CHTML.appendChild(this.html('mjx-root'));
            root = this.childNodes[this.root];
        }
        const SQRT = CHTML.appendChild(this.html('mjx-sqrt', {}, [
            SURD = this.html('mjx-surd'),
            BASE = this.html('mjx-box', {style: {paddingTop: this.em(q)}})
        ]));
        //
        //  Add the child content
        //
        this.addRoot(ROOT, root, sbox);
        surd.toCHTML(SURD);
        base.toCHTML(BASE);
    }

    /*
     * Add root HTML (overridden in mroot)
     *
     * @param{HTMLElement} ROOT   The container for the root
     * @param{CHTMLWrapper} root  The wreapped MML root content
     * @param{BBox} sbox          The bounding box of the surd
     */
    protected addRoot(ROOT: HTMLElement, root: CHTMLWrapper, sbox: BBox) {
    }

    /*
     * @override
     */
    public computeBBox(bbox: BBox) {
        const surdbox = this.childNodes[this.surd].getBBox();
        const basebox = new BBox(this.childNodes[this.base].getBBox());
        const [p, q] = this.getPQ(surdbox);
        const [x] = this.getRootDimens(surdbox);
        const t = this.font.params.rule_thickness;
        const H = bbox.h + q + t;
        bbox.h = H + t;
        this.combineRootBBox(bbox, surdbox);
        bbox.combine(surdbox, x, H - surdbox.h);
        bbox.combine(basebox, x + surdbox.w, 0);
        bbox.clean();
    }

    /*
     * Combine the bounding box of the root (overridden in mroot)
     *
     * @param{BBox} bbox  The bounding box so far
     * @param{BBox} sbox  The bounding box of the surd
     */
    protected combineRootBBox(bbox: BBox, sbox: BBox) {
    }

    /*
     * @param{BBox} sbox  The bounding box for the surd character
     * @return{number[]}  The p, q, and x values for the TeX layout computations
     */
    protected getPQ(sbox: BBox) {
        const t = this.font.params.rule_thickness;
        const p = (this.node.attributes.get('displaystyle') ? this.font.params.x_height : t);
        const q = (sbox.h + sbox.d > this.surdH ? ((sbox.h + sbox.d) - (this.surdH - t)) / 2 : t + p / 4);
        return [p, q];
    }

    /*
     * @param{BBox} sbox  The bounding box of the surd
     * @return{number[]}  The x offset of the surd, and the height, x offset, and scale of the root
     */
    protected getRootDimens(sbox: BBox) {
        return [0, 0, 0, 0];
    }

}
