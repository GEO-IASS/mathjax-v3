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
 * @fileoverview  Implements the MmlMtd node
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {PropertyList} from '../Node.js';
import {AbstractMmlBaseNode, MmlNode} from '../MmlNode.js';
import {INHERIT} from '../Attributes.js';

/*****************************************************************/
/*
 *  Implements the MmlMtd node class (subclass of AbstractMmlBaseNode)
 */

export class MmlMtd extends AbstractMmlBaseNode {
    public static defaults: PropertyList = {
        ...AbstractMmlBaseNode.defaults,
        rowspan: 1,
        columnspan: 1,
        rowalign: INHERIT,
        columnalign: INHERIT,
        groupalign: INHERIT
    };

    /*
     * @return {string}  The mtd kind
     */
    public get kind() {
        return 'mtd';
    }

    /*
     * @return {number}  <mtd> has an inferred mrow
     */
    public get arity() {
        return -1;
    }

    /*
     * @return {boolean}  <mtd> can contain line breaks
     */
    public get linebreakContainer() {
        return true;
    }

    /*
     * @override
     */
    public setTeXclass(prev: MmlNode) {
        this.getPrevClass(prev);
        this.childNodes[0].setTeXclass(null);
        return this;
    }
}