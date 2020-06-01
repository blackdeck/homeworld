

import _ from 'lodash';

import {resources} from '../knowledge/resources';
import {storage, calcAllStorage} from '../knowledge/storage';
import {buildings} from '../knowledge/buildings';
import {upgrades} from '../knowledge/upgrades';



export const default_state = {
    isFull: false,
    
    tab: 'intro',
    
    balances:      _.clone(resources),
    storage_limit: _.clone(resources),
    
    permanent: {
        reputation: 0,
        fame:       0,
        prestige:   0,
        
        constructors: 1,
        donated: false,
        donate: 0,
        usd: 0,
    
        rewards_collected: []
    },
    
    
    slots: 0,
    show_build_menu: false,
    
    storage:   _.mapValues(storage,   () => { return {level: 0, modifier: 1}; }),
    buildings: [], //_.mapValues(buildings, () => { return {level: 0, busy: false, auto_build: true, fullness: 0, modifier: 1, speed_modifier: 1}; }),
    upgrades:  _.mapValues(upgrades,  () => { return {level: 0}; }),
    
    
    constructing: [],
    
    environment: 'space',
    space_era: false,
    
    event: false,
    last_event_tick: 0,
    
    offered_managers: [],
    automated_buildings: [],
    
    rewards: [],

    transport: {
        work: 0,
        task: "idle",
        position: -1
    },
    
    
    
    game_speed: 1000, // 1000
    frame_rate: 10,
    game_speed_multiplier: 1,
    frame: 0,
    tick: 0,
    game_paused: true,
    game_end: false,
    game_end_score: 0,
    
    debug: {
        performance: false
    },
};



export const getDefaultState = () => {
    
    let state = _.cloneDeep(default_state);
    
    // state.buildings = _.mapValues(buildings, () => { return {level: 0, busy: false, auto_build: true, fullness: 0, modifier: 1, speed_modifier: 1}; });
    
    state.slots = 1;
    state.buildings = ['empty'];
        
    state.balances.energy = 1;
    state.balances.energy = 1000000;
   // state.balances.money = 900000;
    
    // state.storage.money1.level = 1;
    state = calcAllStorage(state);
    
    // state.balances.buildings = _.mapValues(buildings, () => { return {level: 1}; });
    
    return state;
};
