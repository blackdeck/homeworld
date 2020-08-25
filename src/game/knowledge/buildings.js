
import _ from 'lodash';

import {isEnough, gainCost} from '../../bdcgin/Gin';
import {checkStorageVolume} from './storage';
import {giveReward} from '../helpers';
import {resources} from "./resources";

export const calcBuildCost = (store, item_key) => {
    // console.log(item_key, store.buildings, store.buildings[item_key]);
    
    return _.mapValues(store.buildings[item_key].base_cost, (item_cost, key) => {
        
        let cost = item_cost * Math.pow(0.99, store.permanent.prestige);
        
        //console.log(item_cost, buildings[item_key].cost_grows, store.buildings[item_key].level);
        // console.log(Math.pow(item_cost, buildings[item_key].cost_grows * store.buildings[item_key].level));
        if (store.buildings[item_key].level > 0 && item_cost > 0) {
            return Math.ceil(cost * Math.pow(store.buildings[item_key].cost_grows, store.buildings[item_key].level));
        }
        else {
            return Math.ceil(cost);
        }
    });
};

export const calcBuildDuration = (store, item_key) => {
    return store.buildings[item_key].base_duration * (store.buildings[item_key].level + 1);
};

export const calcBuildPercent = (store, item_key) => {
    let task = _.find(store.constructing, {item_key: item_key});
    
    return Math.round((store.frame - task.start_frame) * 100 / task.duration );
    
};


export const calcProfit = (store, item_key) => {
    return _.mapValues(store.buildings[item_key].profit, (base_profit) => {
    
        let profit = base_profit * Math.pow(1.01, store.permanent.reputation);
        return Math.round(profit * store.buildings[item_key].level * store.buildings[item_key].modifier * 100) / 100;
    });
};

export const calcCycle = (store, item_key) => {
    return Math.ceil(store.buildings[item_key].cycle / store.buildings[item_key].speed_modifier);
};

export const collectItem = (store, item_key) => {
    // console.log(item_key, buildings[item_key].profit, store.buildings[item_key].level);
    store.buildings[item_key].fullness = 0;
    
    let cost = calcProfit(store, item_key);
    
    store = gainCost(store, checkStorageVolume(store, cost));
    
    return store;
};

export const produceItem = (store, item_key) => {
    store.buildings[item_key].fullness = 0;

    let cost = calcProfit(store, item_key);

    _.each(cost, (value, key) => {
        store.buildings[item_key].buffer[key] += value;

        //костыль
        if (_.isNaN(store.buildings[item_key].buffer[key])) store.buildings[item_key].buffer[key] = 0;
    });

    return store;
};

export const collectProduced = (store, item_key) => {
    store = gainCost(store, checkStorageVolume(store, store.buildings[item_key].buffer));

    store.buildings[item_key].buffer = {};

    return store;
};

export const buildItem = (store, item_key) => {
    
    store.buildings[item_key].busy = true;
    store.constructing.push({item_type: 'buildings', item_key: item_key, start_frame: store.frame, duration: calcBuildDuration(store, item_key)});
    
    // store.buildings[item_key].level++;
    return store;
};

export const buildNewItem = (store, item_key) => {
    
    store.buildings[store.show_build_menu] = _.assign(buildings[item_key], {level: 0, busy: false, auto_build: true, fullness: 0, modifier: 1, speed_modifier: 1, buffer: {}});
    
    store.show_build_menu = false;
    
    // store.constructing.push({item_type: 'buildings', item_key: item_key, start_frame: store.frame, duration: calcBuildDuration(store, item_key)});
    
    // store.buildings[item_key].level++;
    return store;
};

export const finishItem = (store, item_key) => {
    store.buildings[item_key].level++;
    store.buildings[item_key].busy = false;
    
    if (!store.permanent.rewards_collected.includes(item_key)) {
        console.log(item_key);
        store.permanent.rewards_collected.push(item_key);
        store = giveReward(store, {"permanent.donate": 10});
        if (item_key === 'oil1') {
            store = giveReward(store, {"permanent.constructors": 1});
        }
    }
    
     console.log(store);
    
    return store;
};




export var buildings = {
    energy1:      {name: "Solar Panel", type: 'energy',  base_cost: {'balances.energy': 1},  cost_grows: 1.59, profit: {'balances.energy': 1}, base_duration: 10, cycle: 10, text: 'text', isHidden: (store) => false },
    battery1:     {name: "Battery",     type: 'energy',  base_cost: {'balances.energy': 5},  cost_grows: 1.59, profit: {},                     base_duration: 10, cycle: 0,  text: 'text', isHidden: (store) => false },
    laboratory1:  {name: "Laboratory",  type: 'science', base_cost: {'balances.energy': 25}, cost_grows: 1.59, profit: {},                     base_duration: 10, cycle: 0,  text: 'text', isHidden: (store) => false },
    
};