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

import uLang from '../src/lang.js';

describe('Lang tests', () => {

  let lang;
  let mockConfig;
  let mockStrings;
  const value = 1000;

  beforeEach(() => {
    lang = new uLang();
    mockConfig = {
      factorSpeed: 0.33,
      unitSpeed: 'units',
      factorDistance: 1.3,
      unitDistance: 'unitd',
      factorDistanceMajor: 0.55,
      unitDistanceMajor: 'unitdm',
      unitDay: 'unitday'
    };
    mockStrings = {
      string1: 'łańcuch1',
      units: 'jp',
      unitd: 'jo',
      unitdm: 'jo / 1000',
      unitday: 'd'
    }
  });

  it('should create instance', () => {
    expect(lang.strings).toEqual({});
    expect(lang.config).toBe(null);
  });

  it('should initialize', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.strings).toBe(mockStrings);
    expect(lang.config).toBe(mockConfig);
  });

  it('should return localized string', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang._('string1')).toBe(mockStrings.string1);
  });

  it('should throw error on unknown string', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(() => lang._('unknown_string')).toThrowError(/Unknown/);
  });

  it('should return localized unit', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.unit('unitSpeed')).toBe(mockStrings.units);
  });

  it('should return localized speed value', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleSpeed(value, false)).toBe(1188);
  });

  it('should return localized speed value with unit', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleSpeed(value, true)).toBe(`1188 ${mockStrings.units}`);
  });

  it('should return localized distance major value', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleDistanceMajor(value, false)).toBe(0.55);
  });

  it('should return localized distance major value with unit', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleDistanceMajor(value, true)).toBe(`0.55 ${mockStrings.unitdm}`);
  });

  it('should return localized distance value', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleDistance(value, false)).toBe(1300);
  });

  it('should return localized distance value with unit', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleDistance(value, true)).toBe(`1300 ${mockStrings.unitd}`);
  });

  it('should return localized altitude value', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleDistance(value, false)).toBe(1300);
  });

  it('should return localized altitude value with unit', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleDistance(value, true)).toBe(`1300 ${mockStrings.unitd}`);
  });

  it('should return localized accuracy value', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleDistance(value, false)).toBe(1300);
  });

  it('should return localized accuracy value with unit', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleDistance(value, true)).toBe(`1300 ${mockStrings.unitd}`);
  });

  it('should return localized time duration', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleDuration(12345)).toBe('03:25:45');
  });

  it('should return localized time duration with day unit', () => {
    // when
    lang.init(mockConfig, mockStrings);
    // then
    expect(lang.getLocaleDuration(123456789)).toBe(`1428 ${mockStrings.unitday} 21:33:09`);
  });

});
