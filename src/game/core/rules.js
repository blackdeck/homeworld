
import _ from 'lodash';


import {isEnough, gainCost} from '../../bdcgin/Gin';

import {storage, calcStorageCapacity} from '../knowledge/storage';
import {buildings, finishItem, collectItem, calcBuildCost, buildItem, calcCycle} from '../knowledge/buildings';
import {events, genEvent} from '../knowledge/events';
import {managers, generateManager} from '../knowledge/managers';

import {shuffleObject} from '../helpers';
import {transport} from "../knowledge/transport";


export const rules = {
    matrix_show: { onFrame: (store, params = {}) => { store.matrix_show = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); return store; }},
    
    income: {
        onFrame: (store, params = {}) => {
            let automated_buildings = [];
            _.each(store.managers, (manager, key) => {
                // console.log(manager, key);
                _.each(manager.auto_collect, (automated_building) => {
                    automated_buildings.push(automated_building);
                })
            });
            
            
            _.each(_.pickBy(store.buildings, (item) => item !== 'empty'), (building, key) => {
                if (building.level > 0 && store.buildings[key].fullness < calcCycle(store, key)) {
                    store.buildings[key].fullness++;
                }
    
                /*
                // /* auto_collect
                if (store.buildings[key].fullness >= calcCycle(store, key) && automated_buildings.includes(key)) { // store.managers[key].hired
                    store = collectItem(store, key);
                }
                */
            });
            return store;
        },
        
        onTick: (store, params = {}) => {
            
            return store;
        }
    },
    
    
    constructing: {
        onFrame: (store, params = {}) => {
            _.each(store.constructing, (task, key) => {
                if (task.start_frame + task.duration <= store.frame) {
                    if (task.item_type == 'buildings') {
                        store = finishItem(store, task.item_key);
                    }
                }
            });
    
            _.remove(store.constructing, (task) => task.start_frame + task.duration <= store.frame);
    
    
            // /* auto_build
            if (store.constructing.length < store.permanent.constructors) {
                let automated_buildings = [];
                _.each(store.managers, (manager, key) => {
                    // console.log(manager, key);
                    _.each(manager.auto_build, (automated_building) => {
                        automated_buildings.push(automated_building);
                    })
                });
                
                store.automated_buildings = automated_buildings;
    
                _.each(shuffleObject(_.pickBy(store.buildings, {busy: false, auto_build: true})), (building, key) => {
                    if (automated_buildings.includes(key) && store.constructing.length < store.permanent.constructors && isEnough(store, calcBuildCost(store, key))) {
                        store = buildItem(store, key);
                    }
                });
            }
            
            return store;
        },
        
        onTick: (store, params = {}) => {
            
            return store;
        }
    },

    transport: {
        onFrame: (store, params = {}) => {
            let viable_buildings = 0;
            if (store.transport.work > 0) {
                store.transport.work--;
                return store;
            }
            if (store.transport.task === "idle") {
                _.each(_.pickBy(store.buildings, (item) => item !== 'empty'), (building, key) => {
                    if (building.level > 0 && store.buildings[key].fullness >= calcCycle(store, key)) {
                        viable_buildings++;
                    }
                });
                if (viable_buildings > 0) store.transport.task = "forward";
            }
            if (store.transport.task === "forward") {
                if (store.transport.position < store.buildings.length - 1) {
                    store.transport.position++;
                    store.transport.work += transport.move_speed;
                } else {
                    store.transport.task = "collecting";
                }
            }
            if (store.transport.task === "collecting") {
                let building = store.buildings[store.transport.position];
                if (building && building !== "empty") {
                    if (building.level > 0 && building.fullness >= calcCycle(store, store.transport.position)) {
                        store = collectItem(store, store.transport.position);
                        store.transport.work += transport.collect_speed;
                        store.transport.task = "returning";
                    } else {
                        store = transport.moveBackwards(store);
                    }
                } else {
                    store = transport.moveBackwards(store);
                }
            }
            if (store.transport.task === "returning") {
                store = transport.moveBackwards(store);
            }
            return store;
        },

        onTick: (store, params = {}) => {

            return store;
        }
    },
    
    
    events: {
        onFrame: (store, params = {}) => {
            return store;
        },
        
        onTick: (store, params = {}) => {
            if (store.event === false && store.last_event_tick + 30 < store.tick) {
                if (_.random(100000) + (store.tick - store.last_event_tick) >= 100000) {
                    store.event = genEvent(store);
                }
            }
            
            if (store.event !== false && store.event.opened !== true && store.event.start_tick + 7 < store.tick) {
                store.event = false;
                store.last_event_tick = store.tick;
            }
            
            return store;
        }
    },
    
    
    
    
    
};