import React, { Component } from 'react';
import classNames from 'classnames';
import Select from 'react-select';
import Fullscreen from "react-full-screen";
import _ from 'lodash';

import './css/header.css';
import './css/footer.css';
import './css/event.css';
import './css/rewards.css';
import './css/build_menu.css';
import './css/App.css';


import {Gin, isEnough, drawCost, gainCost} from './bdcgin/Gin';
import GinGameMenu from './bdcgin/GinGameMenu';
import GinButton, {StorageGinButton, CollectGinButton, BuildingGinButton, NewBuildingGinButton, AutoBuildingGinButton, UnlockGinButton, HireGinButton, FireGinButton, UpGinButton } from "./bdcgin/GinButton";

import {rules} from './game/core/rules';
import {pick, calcReputation, reset} from './game/helpers';

import {game_name} from './game/core/app_config';
import {getDefaultState} from './game/core/default_state';

import {resources} from './game/knowledge/resources';
import {builder_store, stores, crystals} from './game/knowledge/stores';
import {upgrades, calcUpgradeCost, upgrade} from './game/knowledge/upgrades';
import {storage, calcStorageCost, buyStorage, calcAllStorage} from './game/knowledge/storage';
import {buildings, calcBuildCost, calcCycle, calcProfit, buildItem, collectItem} from './game/knowledge/buildings';
import {managers, hire} from './game/knowledge/managers';
import {checkDisabled, confirmEvent, passEvent} from './game/knowledge/events';



class App extends Component {
    constructor(props) {
        super(props);

        this.gin = new Gin(game_name, getDefaultState);
        this.gin.init();
        //this.gin.addViewHandler(state => { console.log(state, this, this.setState); this.setState(state); });
        this.gin.connectReact(this);
        this.gin.registerRules(rules);
        this.state = getDefaultState();

    }

    componentDidMount() {
        this.gin.loadGame('FirstSave');
        this.gin.playGame();
    }

    componentDidCatch(error, info) {
        console.log('componentDidCatch', error, info);
        if (!localStorage.getItem(game_name+"_retry_flag")) { // production one-try-reloader
            localStorage.setItem(game_name+"_retry_flag", true);
            localStorage.setItem(game_name+"_app_state", null);
            window.location.reload(true);
            return true;
        }
        localStorage.setItem(game_name+"_retry_flag", false);
    }

    changeTab(tab_name) {
        this.gin.setState({tab: tab_name});
    }


    render() {
        let state = this.state;
        
        
        const header_subcomponent =
            <div className="header flex-container-row col">
                {_.map(_.keys(resources), (resource_key) =>
                    <div className="col-xs  flex-element filament">
                        <div className="row-xs filament">{Math.floor(state.balances[resource_key])} {_.capitalize(resource_key)}</div>
                        <div className="row-xs filament">filed: {(state.balances[resource_key]/state.storage_limit[resource_key]*100).toFixed(0)}%</div>
                    </div>
                )}
            </div>;
        
        
        const intro_subcomponent =
            <div className="filament">
                <div className="panel">
                    <h3>Welcome, new president!</h3>
                    <h4>The party in honor of your inauguration went gloriously.</h4>
                    <h4>It's time to get down to duty.</h4>
                </div>
                <div className="panel">
                    <button className="btn btn-lg" onClick={() => {
                        //this.setState({isFull: true});
                        this.changeTab('building');
                    }} title='Arena'>Start Build Your Country</button>
                </div>
                <h4 className="panel">
                    Disclaimer: the game on the early stages of development, bugs are possible! Developers will be grateful if in case of any problem you write to the Support.
                </h4>
            </div>;
        
        const reward_pupup_subcomponent =
            <div className="reward_popup filament">
                <div className="panel">
                    <h2>Reward!</h2>
                    <h3>{drawCost(state.rewards[0])}</h3>
                    <h3><GinButton item={{
                        name: 'Collect!',
                        onClick: (store) => {
                            store = gainCost(store, store.rewards[0]);
                            store.rewards.splice(0, 1);
                            return store; }
                    }} state={state} gin={this.gin} /></h3>
                </div>
            </div>;
    
        const event_trigger_subcomponent =
            <div className="event_trigger filament" onClick={() => this.gin.onClick({onClick: (store) => { store.event.opened = true; return store; }})}>
                <h2>Event!</h2>
            </div>;
    
        const event_popup_subcomponent =
            <div className="event_popup filament">
                <div className="panel">
                    <h3>{state.event.name}</h3>
                    <h4>{state.event.text}</h4>
                    <GinButton item={{
                        name: 'Confirm',
                        isDisabled: checkDisabled,
                        onClick: confirmEvent,
                    }} state={state} gin={this.gin} />
                    <GinButton item={{
                        name: 'Decline',
                        onClick: passEvent,
                    }} state={state} gin={this.gin} />
                </div>
            </div>;
    
        
        const store_subcomponent = (store_item) =>
            <div className="flex-container-row panel">
                <div className="flex-element flex-container-row filament">
                    <div className="flex-element"><GinButton item={store_item} state={state} gin={this.gin} /> </div>
                    <div className="flex-element">Cost: {_.values(store_item.cost)[0]} Crystals</div>
                </div>
                <div className="flex-element">{store_item.text}</div>
            </div>;
    
        const crystal_store_subcomponent = (store_item) =>
            <div className="flex-container-row panel">
                <div className="flex-element flex-container-row filament">
                    <div className="flex-element"><GinButton item={store_item} state={state} gin={this.gin} /> </div>
                    <div className="flex-element">Cost: ${_.values(store_item.cost)[0]} </div>
                </div>
                <div className="flex-element">{store_item.text}</div>
            </div>;
        
        const shop_subcomponent =
            <div className="filament">
                <div className="flex-container-col panel">
                    <h4 className="slim">Shop</h4>
                    <div className="col-xs flex-element filament">
                        <div className="row-xs filament"><GinButton item={{
                            name: 'Add 100 crystals',
                            isDisabled: (store) => store.permanent.donated,
                            onClick: (store) => { store.permanent.donate += 100; store.permanent.donated = true; return store; }
                        }} state={state} gin={this.gin} /></div>
                        <div className="row-xs filament"><h4>You have {state.permanent.donate} crystals</h4></div>
                    
                        <div className="flex-container-col panel">
                            <div className="flex-element"><h5>Builder Shop</h5></div>
                            <div className="row-xs filament"><h5>Current builders: {state.permanent.constructors}</h5></div>
                            {store_subcomponent(builder_store)}
                        </div>
                    
                        <div className="flex-container-col panel">
                            <div className="flex-element"><h5>Hardware store</h5></div>
                            {_.map(stores, (store_item, key) => store_subcomponent(store_item)
                            )}
                        </div>
                    
                        <div className="flex-container-col panel">
                            <div className="flex-element"><h5>Crystal Cove</h5></div>
                            {_.map(crystals, (store_item, key) => crystal_store_subcomponent(store_item)
                            )}
                        </div>
                    
                    
                        { 1 == 0 ?
                            <div className="flex-container-col panel">
                                <div className="row-xs filament"><GinButton item={{
                                    name: 'Add Million Dollars',
                                    cost: {"permanent.donate": 11},
                                    onClick: (store) => { store.balances.money += 1000000; return store; }
                                }} state={state} gin={this.gin} /> Cost: 1 Crystals</div>
                                <div className="row-xs filament"><GinButton item={{
                                    name: 'Fill Storage',
                                    cost: {"permanent.donate": 10},
                                    onClick: (store) => {
                                        _.each(store.balances, (value, key) => {
                                            store.balances[key] = store.storage_limit[key];
                                        });
                                        return store; }
                                }} state={state} gin={this.gin} /> Cost: 10 Crystals</div>
                                <div className="row-xs filament"><GinButton item={{
                                    name: 'Broke The Game',
                                    onClick: (store) => { store.balances.money += 100000000; store.balances.goods += 10000000; store.balances.oil += 1000000; return store; }
                                }} state={state} gin={this.gin} /></div>
                            </div>
                            : '' }
                
                    </div>
                </div>
            </div>;
    
        const building_subcomponent = (item, key) =>
            <div className="flex-element flex-container-row panel filament" key={key}>
                <div className="flex-element flex-container-row slim">
                    <div className="flex-element slim">
                        {state.transport.position === key ? <div style={{ width: "40px", height: "100%", backgroundColor: "#ff0000" }} /> : ""}
                    </div>
                    <div className="flex-element slim"><h3 className="slim">{state.buildings[key].level}</h3></div>
                    <div className="flex-element slim"><h5>{item.name}</h5></div>
                </div>
                <div className="flex-element flex-container-col slim">
                    <div className="flex-element flex-container-row slim">
                        {/*<div className="flex-element"><CollectGinButton item={item} item_key={key} key={key} state={state} gin={this.gin} /></div>*/}
                        <div className="flex-element">Cycle: {state.buildings[key].fullness}/{calcCycle(state, key)}</div>
                    </div>
                    <div className="flex-element">Profit: {(_.values(item.profit)[0] * Math.pow(1.01, state.permanent.reputation)).toFixed(2)} x {state.buildings[key].level} x {state.buildings[key].modifier} = {_.values(calcProfit(state, key))[0]} {item.type} or {(_.values(calcProfit(state, key))[0] / calcCycle(state, key) * 10).toFixed(1)}/sec </div>
                </div>
                <div className="flex-element">
                    <div className="flex-element">
                        <BuildingGinButton item={item} item_key={key} key={key} state={state} gin={this.gin} />
                        {state.automated_buildings.includes(key) ? <AutoBuildingGinButton item={item} item_key={key} key={key} state={state} gin={this.gin} /> : ''}
                    </div>
                    <div className="flex-element">Cost: {drawCost(calcBuildCost(state, key))}</div>
                </div>
            </div>;
        
        const buildings_subcomponent =
            <div className="filament">
                <div className="flex-container-col panel">
                    <h4 className="slim">Building</h4>
                    {_.times(state.slots, (slot_id) => state.buildings[slot_id] !== 'empty'
                        ? building_subcomponent(state.buildings[slot_id], slot_id)
                        :
                        <div className="flex-element flex-container-row panel filament" key={slot_id}>
                            <h3 className="slim">
                                <GinButton item={{name: "Build", onClick: (store) => _.assign(store, {show_build_menu: slot_id}) }} item_key={slot_id} key={slot_id} state={state} gin={this.gin} />
                            </h3>
                        </div>
                    )}
    
                    <div className="flex-element flex-container-row panel filament">
                        <h3 className="slim">
                            <UnlockGinButton key={'unlock'} state={state} gin={this.gin} />
                        </h3>
                    </div>
                    
                </div>
            </div>;
        
        const build_menu_pupup_subcomponent =
            <div className="build_menu_popup filament">
                <div className="panel">
                    <h2>New Building</h2>
                    {_.map(buildings, (item, key) =>
                        <div className="flex-element flex-container-row panel filament" key={key}>
                            <div className="flex-element flex-container-row slim">
                                <div className="flex-element slim"><h5>{item.name}</h5></div>
                            </div>
                            <div className="flex-element">
                                <div className="flex-element">
                                    <NewBuildingGinButton item={item} item_key={key} key={key} state={state} gin={this.gin} />
                                </div>
                                <div className="flex-element">Cost: {drawCost(item.base_cost)}</div>
                            </div>
                        </div>
                        )}
                </div>
            </div>;
        
        const upgrade_subcomponent =
            <div className="filament">
                <div className="flex-container-col panel">
                    <h4 className="slim">Upgrades</h4>
                    {_.map(pick(state, upgrades), (item, key) =>
                        <div className="flex-element flex-container-row panel filament" key={key}>
                            <div className="flex-element flex-container-col slim">
                                <div className="flex-element slim"><h3 className="slim">{state.upgrades[key].level}</h3></div>
                                <div className="flex-element slim"><h5>{item.name}</h5></div>
                            </div>
                            <div className="flex-element">
                                <div className="flex-element">Affected:</div>
                                <div className="flex-element">{drawCost(item.affected, true)}</div>
                            </div>
                            <div className="flex-element">
                                <div className="flex-element"><UpGinButton item={item} item_key={key} key={key} state={state} gin={this.gin} /></div>
                                <div className="flex-element">Cost: {drawCost(calcUpgradeCost(state, key))}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>;
    
        const defence_subcomponent =
            <div className="filament">
                <div className="flex-container-col panel">
                    <h4>Defence</h4>
                </div>
            </div>;
        
        const footer_subcomponent =
            <div className="footer col">
                <span className="col-xs filament"><a onClick={() => { this.changeTab('shop'); }} title='Shop'>  Shop</a></span>
                <span className="col-xs filament"><a onClick={() => { this.changeTab('building'); }} title='Building'>  Building</a></span>
                <span className="col-xs filament"><a onClick={() => { this.changeTab('upgrade'); }}  title='Upgrade'>   Upgrade</a></span>
                <span className="col-xs filament"><a onClick={() => { this.changeTab('defence'); }} title='Defence'>  Defence</a></span>
            </div>;
        
        
        return (
            <Fullscreen
                enabled={state.isFull}
                onChange={isFull => this.gin.setState({isFull})}
            >
                <div className="App" style={{backgroundImage: 'url(/bg-' + state.environment + '.png)'}}>
                    <div className="filament content_container" role="main">
                        {state.tab !== 'intro' ?
                            header_subcomponent
                            : ''}
                        
                        {state.tab === 'intro' ?
                            intro_subcomponent
                            : ''}
    
                        {state.rewards.length > 0 ?
                            reward_pupup_subcomponent
                            : ''}
                            
                        {state.event !== false && state.event.opened === false ?
                            event_trigger_subcomponent
                            : ''}
                        {state.event !== false && state.event.opened === true ?
                            event_popup_subcomponent
                            : ''}
    
    
                        {state.show_build_menu !== false ?
                            build_menu_pupup_subcomponent
                            : ''}
                            
                        <div style={{width: '100%', height: '70px'}}></div>
                        
                        {state.tab === 'shop' ?
                            shop_subcomponent
                            : ''}
                        {state.tab === 'building' ?
                            buildings_subcomponent
                            : ''}
                        {state.tab === 'upgrade' ?
                            upgrade_subcomponent
                            : ''}
                        {state.tab === 'defence' ?
                            defence_subcomponent
                            : ''}

                        <div style={{width: '100%', height: '40px'}}></div>
    
                        {state.tab !== 'intro' ?
                            footer_subcomponent
                            : ''}
                    </div>
                </div>
            </Fullscreen>
        );
    }
}

export default App;
