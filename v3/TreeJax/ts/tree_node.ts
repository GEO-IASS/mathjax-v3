/*************************************************************
 *
 *  Copyright (c) 2015-2016 The MathJax Consortium
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
 * @fileoverview Tree node classes.
 *
 * @author v.sorge@mathjax.org (Volker Sorge)
 */

import {Visitable, Visitor} from './visitor';
import {LeafNode} from './leaf_node';

export enum Kind {
  mi,
  mo,
  mn,
  mtext,
  mspace,
  ms,
  mrow,
  mfrac,
  msqrt,
  mroot,
  mstyle,
  merror,
  mpadded,
  mphantom,
  mfenced,
  menclose,
  msub,
  msup,
  msubsup,
  munder,
  mover,
  munderover,
  mmultiscripts,
  mprescripts,
  mtable,
  mlabeledtr,
  mtr,
  mtd,
  maligngroup,
  malignmark,
  mstack,
  mlongdiv,
  msgroup,
  msrow,
  mscarries,
  mscarry,
  msline,
  maction,
  math,
  semantics,
  annotation,
  'annotation-xml',
  none,
  dummy = -1
}

const kinds: [Kind, string][] =
  [[Kind.mi, 'mi'],
   [Kind.mo, 'mo'],
   [Kind.mn, 'mn'],
   [Kind.mtext, 'mtext'],
   [Kind.mspace, 'mspace'],
   [Kind.ms, 'ms'],
   [Kind.mrow, 'mrow'],
   [Kind.mfrac, 'mfrac'],
   [Kind.msqrt, 'msqrt'],
   [Kind.mroot, 'mroot'],
   [Kind.mstyle, 'mstyle'],
   [Kind.merror, 'merror'],
   [Kind.mpadded, 'mpadded'],
   [Kind.mphantom, 'mphantom'],
   [Kind.mfenced, 'mfenced'],
   [Kind.menclose, 'menclose'],
   [Kind.msub, 'msub'],
   [Kind.msup, 'msup'],
   [Kind.msubsup, 'msubsup'],
   [Kind.munder, 'munder'],
   [Kind.mover, 'mover'],
   [Kind.munderover, 'munderover'],
   [Kind.mmultiscripts, 'mmultiscripts'],
   [Kind.mprescripts, 'mprescripts'],
   [Kind.mtable, 'mtable'],
   [Kind.mlabeledtr, 'mlabeledtr'],
   [Kind.mtr, 'mtr'],
   [Kind.mtd, 'mtd'],
   [Kind.maligngroup, 'maligngroup'],
   [Kind.malignmark, 'malignmark'],
   [Kind.mstack, 'mstack'],
   [Kind.mlongdiv, 'mlongdiv'],
   [Kind.msgroup, 'msgroup'],
   [Kind.msrow, 'msrow'],
   [Kind.mscarries, 'mscarries'],
   [Kind.mscarry, 'mscarry'],
   [Kind.msline, 'msline'],
   [Kind.maction, 'maction'],
   [Kind.math, 'math'],
   [Kind.semantics, 'semantics'],
   [Kind.annotation, 'annotation'],
   [Kind['annotation-xml'], 'annotation-xml'],
   [Kind.none, 'none'],
   [Kind.dummy, 'dummy']
  ];
export const Tag: Map<Kind, string> = new Map<Kind, string>(kinds);

export interface TreeNode extends Visitable {

  /**
   * @return {Kind} The type of the node.
   */
  readonly kind: Kind;

  /**
   * @return {TreeNode} The parent of the node.
   */
  getParent(): TreeNode;


  /**
   * Sets the parent of the node.
   * @param {TreeNode} parent The new parent.
   */
  setParent(children: TreeNode): void;

  /**
   * @return {Array.<TreeNode>} The children of the node.
   */
  getChildren(): TreeNode[];


  /**
   * Sets the children of the node.
   * @param {Array.<TreeNode>} children The new children.
   */
  setChildren(children: TreeNode[]): void;

  /**
   * @return {number|boolean} The arity of the node.
   */
  readonly arity: number|boolean;

  /**
   * Sets the attributes of the node.
   * @param {Object.<string, string>} attributes The new attributes.
   */
  setAttributes(attributes: {[kind: string]: string}): void;

  /**
   * @return {Object.<string, string>} Returns the attributes of the node.
   */
  getAttributes(): {[kind: string]: string};

  /**
   * Sets the TeX Atom of the node.
   * @param {string} texAtom The new TeX Atom.
   */
  setTexAtom(texAtom: string): void;

  /**
   * @return {string} Returns the TeX Atom of the node.
   */
  getTexAtom(): string;

  /**
   * @return {boolean} True if node is a leaf.
   */
  isLeaf(): boolean;

  /**
   * @return {boolean} True if node is a leaf.
   */
  isEmpty(): boolean;

  /**
   * @return {boolean} True if node is an inferred mrow.
   */
  isInferred(): boolean;

}

export abstract class AbstractNode implements TreeNode {

  private attributes: {[kind: string]: string} = {};
  private children: TreeNode[];
  private parent: TreeNode;
  private tag: string;
  private texAtom: string = '';
  
  /**
   * @param {string} kind The type of node.
   * @param {number} arity The arity of the node.
   * @constructor
   * @implements {TreeNode}
   */
  constructor(private _kind: Kind, private _arity: number|boolean) { };

  /**
   * @override
   */
  public get kind() {
    return this._kind;
  }

  /**
   * @override
   */
  public get arity() {
    return this._arity;
  }

  /**
   * @override
   */
  public getParent() {
    return this.parent;
  }

  /**
   * @override
   */
  public setParent(parent: TreeNode) {
    this.parent = parent;
  }

  /**
   * @override
   */
  public getChildren() {
    return this.children;
  }

  /**
   * @override
   */
  public setChildren(children: TreeNode[]) {
    let arity = this.arity;
    if (arity === true ||
        (!arity && !children.length) ||
        arity === children.length) {
      this.children = children;
    } else {
      throw('Wrong number of arguments for type ' +
            Tag.get(this.kind) + '.');
    }
  }

  /**
   * @override
   */
  public getAttributes() {
    return this.attributes;
  }

  /**
   * @override
   */
  public setAttributes(attributes: {[kind: string]: string}) {
    this.attributes = attributes;
  }

  /**
   * @override
   */
  public setTexAtom(texAtom: string) {
    this.texAtom = texAtom;
  }

  /**
   * @override
   */
  public getTexAtom() {
    return this.texAtom;
  }

  /**
   * @override
   */
  public isLeaf() {
    return false;
  }

  /**
   * @override
   */
  public isEmpty() {
    return false;
  }

  /**
   * @override
   */
  public isInferred() {
    return false;
  }

  /**
   * @override
   */
  public accept(visitor: Visitor) {
    visitor.visitNode(this);
  }

}
