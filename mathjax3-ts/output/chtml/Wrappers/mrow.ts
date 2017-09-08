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
 * @fileoverview  Implements the CHTMLmrow wrapper for the MmlMrow object
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {CHTMLWrapper} from '../Wrapper.js';
import {CHTMLWrapperFactory} from '../WrapperFactory.js';
import {MmlMrow, MmlInferredMrow} from '../../../core/MmlTree/MmlNodes/mrow.js';
import {MmlNode} from '../../../core/MmlTree/MmlNode.js';
import {BBox} from '../BBox.js';
import {DIRECTION} from '../FontData.js';

/*****************************************************************/
/*
 *  The CHTMLmrow wrapper for the MmlMrow object
 */

export class CHTMLmrow extends CHTMLWrapper {
    public static kind = MmlMrow.prototype.kind;

    /*
     * @override
     * @constructor
     */
    constructor(factory: CHTMLWrapperFactory, node: MmlNode, parent: CHTMLWrapper = null) {
        super(factory, node, parent);
        this.stretchChildren();
    }

    /*
     * @override
     */
    public toCHTML(parent: HTMLElement) {
        let chtml = parent;
        if (!this.node.isInferred) {
            chtml = this.standardCHTMLnode(parent);
        }
        let hasNegative = false;
        for (const child of this.childNodes) {
            child.toCHTML(chtml);
            if (child.bbox && child.bbox.w < 0) {
                hasNegative = true;
            }
        }
        // FIXME:  handle line breaks
        if (hasNegative) {
            const {w} = this.getBBox();
            if (w) chtml.style.width = this.em(Math.max(0, w));
            if (w < 0) chtml.style.marginRight = this.em(w);
        }
    }

    /*
     * @return{number}  The number of stretchable child nodes
     */
    /*
     * Handle vertical stretching of children to match height of
     *  other nodes in the row.
     */
    protected stretchChildren() {
        let stretchy: CHTMLWrapper[] = [];
        //
        //  Locate and count the stretchy children
        //
        for (const child of this.childNodes) {
            if (child.canStretch(DIRECTION.Vertical)) {
                stretchy.push(child);
            }
        }
        let count = stretchy.length;
        let nodeCount = this.childNodes.length;
        if (count && nodeCount > 1) {
            let H = 0, D = 0;
            //
            //  If all the children are stretchy, find the largest one,
            //  otherwise, find the height and depth of the non-stretchy
            //  children.
            //
            let all = (count > 1 && count === nodeCount);
            for (const child of this.childNodes) {
                const noStretch = !child.stretch;
                if (all || noStretch) {
                    const {h, d} = child.getBBox(noStretch);
                    if (h > H) H = h;
                    if (d > D) D = d;
                }
            }
            //
            //  Stretch the stretchable children
            //
            for (const child of stretchy) {
                child.coreMO().getStretchedVariant([H, D]);
            }
        }
    }

}

/*****************************************************************/
/*
 *  The CHTMLinferredMrow wrapper for the MmlInferredMrow object
 */

export class CHTMLinferredMrow extends CHTMLmrow {
    public static kind = MmlInferredMrow.prototype.kind;

    /*
     * Since inferred rows don't produce a container span, we can't
     * set a font-size for it, so we inherit the parent scale
     *
     * @override
     */
    protected getScale() {
        this.bbox.scale = this.parent.bbox.scale;
        this.bbox.rscale = 1;
    }
}
