/*
 * μlogger
 *
 * Copyright(C) 2019 Bartek Fabiszewski (www.fabiszewski.net)
 *
 * This is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses/>.
 */

export default class uSelect {

  /**
   * @param {HTMLSelectElement} element Select element
   * @param {string=} head Optional header text
   */
  constructor(element, head) {
    this.element = element;
    this.hasAllOption = false;
    this.allText = '';
    if (head && head.length) {
      this.head = head;
    } else {
      this.hasHead = false;
      this.headText = '';
    }
  }

  /**
   * @param {string} value
   */
  set selected(value) {
    if (this.hasValue(value)) {
      this.element.value = value;
    }
  }

  /**
   * @param {string} text
   */
  set head(text) {
    if (text.length) {
      this.hasHead = true;
      this.headText = text;
      this.addHead();
    }
  }

  /**
   * @param {string=} text Optional text
   */
  showAllOption(text) {
    if (text) {
      this.allText = text;
    }
    this.hasAllOption = true;
    const index = this.hasHead ? 1 : 0;
    this.element.add(new Option(this.allText, 'all'), index);
  }

  hideAllOption() {
    this.hasAllOption = false;
    this.remove('all');
  }

  addHead() {
    const head = new Option(this.headText, '0', true, true);
    head.disabled = true;
    this.element.options.add(head, 0);
  }

  /**
   * @param {string} value
   * @return {boolean}
   */
  hasValue(value) {
    return (typeof this.getOption(value) !== 'undefined');
  }

  /**
   * @param {string} value
   */
  getOption(value) {
    return [ ...this.element.options ].find((o) => o.value === value);
  }

  /**
   * @param {string} value
   */
  remove(value) {
    /** @type HTMLOptionElement */
    const option = this.getOption(value);
    if (option) {
      this.element.remove(option.index);
    }
  }

  /**
   * @param {uListItem[]} options
   * @param {string=} selected
   */
  setOptions(options, selected) {
    selected = selected || '';
    this.element.options.length = 0;
    if (this.hasHead) {
      this.addHead();
    }
    if (this.hasAllOption) {
      this.element.add(new Option(this.allText, 'all', false, selected === 'all'));
    }
    for (const option of options) {
      this.element.add(new Option(option.listText, option.listValue, false, selected === option.listValue));
    }
  }
}
