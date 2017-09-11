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
 * @fileoverview  Implements the MmlMtable node
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {PropertyList, Node} from '../../Tree/Node.js';
import {MmlNode, AbstractMmlNode, AttributeList, TEXCLASS} from '../MmlNode.js';

/*****************************************************************/
/*
 *  Implements the MmlMtable node class (subclass of AbstractMmlNode)
 */

export class MmlMtable extends AbstractMmlNode {
    public static defaults: PropertyList = {
        ...AbstractMmlNode.defaults,
        align: 'axis',
        rowalign: 'baseline',
        columnalign: 'center',
        groupalign: '{left}',
        alignmentscope: true,
        columnwidth: 'auto',
        width: 'auto',
        rowspacing: '1ex',
        columnspacing: '.8em',
        rowlines: 'none',
        columnlines: 'none',
        frame: 'none',
        framespacing: '0.4em 0.5ex',
        equalrows: false,
        equalcolumns: false,
        displaystyle: false,
        side: 'right',
        minlabelspacing: '0.8em'
    };
    public properties = {
        useHeight: 1
    };
    public texClass = TEXCLASS.ORD;

    /*
     * @return {string}  The mtable kind
     */
    public get kind() {
        return 'mtable';
    }

    /*
     * @return {boolean}  Linebreaks are allowed in tables
     */
    public get linebreakContainer() {
        return true;
    }

    /*
     * Make sure all children are mtr or mlabeledtr nodes
     * Inherit the table attributes, and set the display attribute based on the table's displaystyle attribute
     *
     * @override
     */
    protected setChildInheritedAttributes(attributes: AttributeList, display: boolean, level: number, prime: boolean) {
        for (const child of this.childNodes) {
            if (!child.isKind('mtr')) {
                this.replaceChild(this.factory.create('mtr'), child)
                    .appendChild(child);
            }
        }
        display = !!(this.attributes.getExplicit('displaystyle') || this.attributes.getDefault('displaystyle'));
        super.setChildInheritedAttributes(attributes, display, level, prime);
    }

    /*
     * Check that children are mtr or mlabeledtr
     *
     * @override
     */
    protected verifyChildren(options: PropertyList) {
        if (!options['fixMtables']) {
            for (const child of this.childNodes) {
                if (!child.isKind('mtr')) {
                    this.mError('Children of ' + this.kind + ' must be mtr or mlabeledtr', options);
                }
            }
        }
        super.verifyChildren(options);
    }

    /*
     * @override
     */
    public setTeXclass(prev: MmlNode) {
        this.getPrevClass(prev);
        for (const child of this.childNodes) {
            child.setTeXclass(null);
        }
        return this;
    }
}
