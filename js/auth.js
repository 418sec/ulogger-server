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

import UserDialog from './userdialog.js';
import { lang } from './constants.js';
import uEvent from './event.js';

export default class uAuth {

  constructor() {
    /** @type {boolean} */
    this._isAdmin = false;
    /** @type {boolean} */
    this._isAuthenticated = false;
    /** @type {?uUser} */
    this._user = null;
  }

  /**
   * @param {uUser} user
   */
  set user(user) {
    this._user = user;
    this._isAuthenticated = true;
  }

  /**
   * @param {boolean} isAdmin
   */
  set isAdmin(isAdmin) {
    this._isAdmin = true;
  }

  /**
   * @return {boolean}
   */
  get isAdmin() {
    return this._isAdmin;
  }

  /**
   * @return {boolean}
   */
  get isAuthenticated() {
    return this._isAuthenticated;
  }

  /**
   * @return {?uUser}
   */
  get user() {
    return this._user;
  }

  /**
   * @param {uEvent} event
   */
  handleEvent(event) {
    if (event.type === uEvent.PASSWORD && this.isAuthenticated) {
      this.changePassword();
    }
  }

  /**
   * @param {UserDialog=} modal
   */
  changePassword(modal) {
    const dialog = modal || new UserDialog('pass', this.user);
    dialog.show()
      .then((result) => this.user.changePass(result.data.password, result.data.oldPassword))
      .then(() => {
        alert(lang.strings['actionsuccess']);
        dialog.hide();
      })
      .catch((msg) => {
        alert(`${lang.strings['actionfailure']}\n${msg}`);
        this.changePassword(dialog);
      });
  }
}
