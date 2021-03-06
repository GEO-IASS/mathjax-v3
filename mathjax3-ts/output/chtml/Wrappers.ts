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
 * @fileoverview  An object listing all the CHTMLWrapper classes
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {CHTMLWrapper} from './Wrapper.js';
import {CHTMLmo} from './Wrappers/mo.js';
import {CHTMLmspace} from './Wrappers/mspace.js';
import {CHTMLmrow, CHTMLinferredMrow} from './Wrappers/mrow.js';
import {CHTMLmfrac} from './Wrappers/mfrac.js';
import {CHTMLTextNode} from './Wrappers/TextNode.js';

export const CHTMLWrappers: {[kind: string]: typeof CHTMLWrapper}  = {
    [CHTMLmrow.kind]: CHTMLmrow,
    [CHTMLinferredMrow.kind]: CHTMLinferredMrow,
    [CHTMLmo.kind]: CHTMLmo,
    [CHTMLmspace.kind]: CHTMLmspace,
    [CHTMLmfrac.kind]: CHTMLmfrac,
    [CHTMLTextNode.kind]: CHTMLTextNode,
    [CHTMLWrapper.kind]: CHTMLWrapper
};
