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

import { config, lang } from '../src/initializer.js';
import MapViewModel from '../src/mapviewmodel.js';
import TrackFactory from './helpers/trackfactory.js';
import ViewModel from '../src/viewmodel.js';
import uObserve from '../src/observe.js';
import uState from '../src/state.js';
import uUtils from '../src/utils.js';

describe('MapViewModel tests', () => {

  let vm;
  let state;
  let mapEl;
  let mockApi;
  let bounds;
  let track;
  const defaultApi = 'mockApi';

  beforeEach(() => {
    const fixture = `<div id="fixture">
                       <div id="map-canvas"></div>
                     </div>`;
    document.body.insertAdjacentHTML('afterbegin', fixture);
    mapEl = document.querySelector('#map-canvas');
    config.reinitialize();
    config.mapApi = defaultApi;
    lang.init(config);
    mockApi = jasmine.createSpyObj('mockApi', {
      'init': Promise.resolve(),
      'getBounds': { /* ignored */ },
      'cleanup': { /* ignored */ },
      'zoomToBounds': { /* ignored */ },
      'zoomToExtent': { /* ignored */ },
      'displayTrack': { /* ignored */ },
      'clearMap': { /* ignored */ }
    });
    state = new uState();
    vm = new MapViewModel(state);
    spyOn(vm, 'getApi').and.returnValue(mockApi);
    spyOn(lang, 'getLocaleSpeed');
    spyOn(lang, 'getLocaleDistance');
    spyOn(lang, 'getLocaleDistanceMajor');
    spyOn(lang, '_').and.returnValue('{placeholder}');
    bounds = [ 1, 2, 3, 4 ];
    track = TrackFactory.getTrack(0);
  });

  afterEach(() => {
    document.body.removeChild(document.querySelector('#fixture'));
    uObserve.unobserveAll(lang);
  });

  it('should create instance', () => {
    // then
    expect(vm).toBeInstanceOf(ViewModel);
    expect(vm.state).toBe(state);
    expect(vm.mapElement).toBe(mapEl);
    expect(vm.api).toBe(null);
  });

  it('should load openlayers api and call onReady', (done) => {
    // given
    spyOn(vm, 'onReady');
    // when
    vm.loadMapAPI('openlayers');
    // then
    setTimeout(() => {
      expect(vm.getApi).toHaveBeenCalledWith('openlayers');
      expect(vm.onReady).toHaveBeenCalledTimes(1);
      done();
    }, 100);

  });

  it('should load gmaps api and fail with error, config map api should be set to another api', (done) => {
    // given
    spyOn(vm, 'onReady');
    spyOn(uUtils, 'error');
    mockApi.init.and.returnValue(Promise.reject(new Error('init failed')));
    // when
    vm.loadMapAPI('gmaps');
    // then
    setTimeout(() => {
      expect(vm.getApi).toHaveBeenCalledWith('gmaps');
      expect(vm.onReady).not.toHaveBeenCalled();
      expect(config.mapApi).toBe('openlayers');
      expect(uUtils.error).toHaveBeenCalledWith(jasmine.any(Error), jasmine.stringMatching('init failed'));
      done();
    }, 100);
  });

  it('should replace map api, get bounds from map and clean up previous api', (done) => {
    // given
    spyOn(vm, 'onReady');
    vm.api = mockApi;
    // when
    vm.loadMapAPI('gmaps');
    // then
    setTimeout(() => {
      expect(mockApi.getBounds).toHaveBeenCalledTimes(1);
      expect(mockApi.cleanup).toHaveBeenCalledTimes(1);
      done();
    }, 100);
  });

  it('should zoom to bounds if has saved bounds', () => {
    // given
    vm.api = mockApi;
    vm.savedBounds = bounds;
    // when
    vm.onReady();
    // then
    expect(mockApi.zoomToBounds).toHaveBeenCalledTimes(1);
    expect(mockApi.zoomToBounds).toHaveBeenCalledWith(bounds);
  });

  it('should not zoom to bounds if there are no saved bounds', () => {
    // given
    vm.api = mockApi;
    vm.savedBounds = null;
    // when
    vm.onReady();
    // then
    expect(mockApi.zoomToBounds).not.toHaveBeenCalled();
  });

  it('should display track with update if current track is set in state and bounds are not set', () => {
    // given
    vm.api = mockApi;
    state.currentTrack = track;
    vm.savedBounds = null;
    // when
    vm.onReady();
    // then
    expect(mockApi.displayTrack).toHaveBeenCalledTimes(1);
    expect(mockApi.displayTrack).toHaveBeenCalledWith(track, true);
  });

  it('should display track without update if current track is set in state and bounds are set', () => {
    // given
    vm.api = mockApi;
    state.currentTrack = track;
    vm.savedBounds = bounds;
    // when
    vm.onReady();
    // then
    expect(mockApi.displayTrack).toHaveBeenCalledTimes(1);
    expect(mockApi.displayTrack).toHaveBeenCalledWith(track, false);
  });

  it('should load map api on api changed in config', (done) => {
    // given
    spyOn(vm, 'loadMapAPI');
    vm.api = mockApi;
    vm.setObservers();
    const newApi = 'newapi';
    // when
    config.mapApi = newApi;
    // then
    setTimeout(() => {
      expect(vm.loadMapAPI).toHaveBeenCalledTimes(1);
      expect(vm.loadMapAPI).toHaveBeenCalledWith(newApi);
      done();
    }, 100);
  });

  it('should clear map when state current track is cleared', (done) => {
    // given
    vm.api = mockApi;
    state.currentTrack = null;
    vm.setObservers();
    uObserve.setSilently(state, 'currentTrack', track);
    // when
    state.currentTrack = null;
    // then
    setTimeout(() => {
      expect(mockApi.clearMap).toHaveBeenCalledTimes(1);
      expect(mockApi.displayTrack).not.toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should display track when state current track is set and update track when new positions are added', (done) => {
    // given
    vm.api = mockApi;
    state.currentTrack = null;
    vm.setObservers();
    // when
    state.currentTrack = track;
    // then
    setTimeout(() => {
      expect(mockApi.clearMap).toHaveBeenCalledTimes(1);
      expect(mockApi.displayTrack).toHaveBeenCalledTimes(1);
      expect(mockApi.displayTrack).toHaveBeenCalledWith(track, true);
      // when
      mockApi.displayTrack.calls.reset();
      state.currentTrack.positions.push(TrackFactory.getPosition(100));
      // then
      setTimeout(() => {
        expect(mockApi.zoomToExtent).toHaveBeenCalledTimes(1);
        expect(mockApi.displayTrack).toHaveBeenCalledTimes(1);
        expect(mockApi.displayTrack).toHaveBeenCalledWith(track, false);
        done();
      }, 100);
    }, 100);
  });

  it('should get popup html content', () => {
    // given
    const id = 0;
    spyOn(uUtils, 'sprintf');
    state.currentTrack = TrackFactory.getTrack(2);
    // when
    const html = vm.getPopupHtml(id);
    const element = uUtils.nodeFromHtml(html);
    // then
    expect(element).toBeInstanceOf(HTMLDivElement);
    expect(element.id).toBe('popup');
    expect(uUtils.sprintf.calls.mostRecent().args[1]).toBe(id + 1);
    expect(uUtils.sprintf.calls.mostRecent().args[2]).toBe(state.currentTrack.length);
  });

  it('should get popup with stats when track does not contain only latest positions', () => {
    // given
    const id = 0;
    spyOn(uUtils, 'sprintf');
    state.currentTrack = TrackFactory.getTrack(2);
    state.showLatest = false;
    // when
    const html = vm.getPopupHtml(id);
    // then
    expect(html).toContain('id="pright"');
  });

  it('should get popup without stats when track contains only latest positions', () => {
    // given
    const id = 0;
    spyOn(uUtils, 'sprintf');
    state.currentTrack = TrackFactory.getTrack(2);
    state.showLatest = true;
    // when
    const html = vm.getPopupHtml(id);
    // then
    expect(html).not.toContain('id="pright"');
  });

  it('should get marker svg source with given size and without extra border', () => {
    // given
    spyOn(MapViewModel, 'getMarkerPath').and.callThrough();
    spyOn(MapViewModel, 'getMarkerExtra').and.callThrough();
    const fill = 'black';
    const isLarge = false;
    const isExtra = false;
    // when
    const dataUri = MapViewModel.getSvgSrc(fill, isLarge, isExtra);
    const svgSrc = decodeURIComponent(dataUri.replace(/data:image\/svg\+xml,/, ''));
    const element = uUtils.nodeFromHtml(svgSrc);
    // then
    expect(element).toBeInstanceOf(SVGElement);
    expect(svgSrc).toContain(`fill="${fill}"`);
    expect(MapViewModel.getMarkerPath).toHaveBeenCalledWith(isLarge);
    expect(MapViewModel.getMarkerExtra).not.toHaveBeenCalled();
  });

  it('should get marker svg source with given size and with extra border', () => {
    // given
    spyOn(MapViewModel, 'getMarkerPath').and.callThrough();
    spyOn(MapViewModel, 'getMarkerExtra').and.callThrough();
    const fill = 'black';
    const isLarge = true;
    const isExtra = true;
    // when
    const dataUri = MapViewModel.getSvgSrc(fill, isLarge, isExtra);
    const svgSrc = decodeURIComponent(dataUri.replace(/data:image\/svg\+xml,/, ''));
    const element = uUtils.nodeFromHtml(svgSrc);
    // then
    expect(element).toBeInstanceOf(SVGElement);
    expect(svgSrc).toContain(`fill="${fill}"`);
    expect(MapViewModel.getMarkerPath).toHaveBeenCalledWith(isLarge);
    expect(MapViewModel.getMarkerExtra).toHaveBeenCalledWith(isLarge);
  });

});
