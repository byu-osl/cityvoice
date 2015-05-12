'use strict';

var React  = require('react');
var styles = require('../styles');
var _ = require('../_');

var Map = require('./Map.jsx');

// LocationSection of the form
module.exports = React.createClass({

    validate: function() {
        var isValid = (this.state.location.length > 0 || this.state.usedDetection || this.getLat());
        this.setState({isValid:isValid});
        return isValid;
    },

    getInitialState: function () {
        return {
            location: '',
            loading: false,
            usedDetection: false,
            isValid: undefined
        };
    },

    getLocation:   function () {return this.state.location},
    getLat:        function () {return this.refs.map.getLatLng().lat()},
    getLong:       function () {return this.refs.map.getLatLng().lng()},

    // TODO: get rid of this?
    usedDetection: function () {return this.state.usedDetection},

    setLocation: function (positionData) {
        var lat = positionData.coords.latitude;
        var long = positionData.coords.longitude;

        this.refs.map.setMarkerPosition(lat, long);

        this.setState({
            usedDetection: true,
            isValid: true,
            loading: false
        });
    },

    handleLocationClick: function (event) {
        this.setState({loading: true});
        event.preventDefault();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.setLocation, null, {enableHighAccuracy:true});
        } else {
            // report that they don't have 
        }
    },

    onGeocode: function (results, status) {
        if (!isUndefined(this.state.isValid)) {
            this.validate();
        }

        this.setState({
            location:results[0].formatted_address,
        });
    },

    markValid: function () {
        this.setState({isValid:true});
    },

    handleChange: function (event) {
        if (!isUndefined(this.state.isValid)) {
            this.validate();
        }

        this.setState({
            location:event.target.value,
            usedDetection: false
        });
    },

    render: function () {
        var validationState = '';
        var errorStyle = styles.hidden;
        var autofocus;
        var buttonStyle = {
          marginLeft: 10
        }

        var markerStyle = {
            color: 'rgb(207, 99, 99)',
        }

        var loadingStyle = {
            border: 'none',
            top: -5,
            position: 'relative',
            paddingRight: 2,
            height: 9,
            marginRight: 5
        }

        _.assign(markerStyle, styles.hiddenIf(this.state.loading));
        _.assign(loadingStyle, styles.visibleIf(this.state.loading));

        if (this.state.isValid === false) {
            validationState += ' has-error';
            errorStyle = styles.visible;
        }

        if (this.state.isValid === true) {
            validationState += ' has-success';
         }

        return (
            <div className="row">
                <div className={'form-group' + validationState}>
                    <div style={{marginBottom:5}}>
                        <p style={errorStyle} className='bg-warning'>Please choose a location.</p>
                        <label className='control-label'>Location</label>
                        <button 
                            style={buttonStyle}
                            className='btn btn-default btn-xs location-button' 
                            onClick={this.handleLocationClick}>
                            <span  style={markerStyle} className='glyphicon glyphicon-map-marker'/>
                            <img style={loadingStyle} src='../../images/location-loader.gif'/>
                            go to my location
                        </button>
                    </div>
                    <Map markValid={this.markValid} onBlur={this.validate} onGeocode={this.onGeocode} ref='map'/>
                    <input 
                        style={{marginTop: 5}}
                        onChange={this.handleChange}
                        onBlur={this.validate}
                        tabIndex='1'
                        ref='input' 
                        className='form-control' 
                        name='location' 
                        type='text' 
                        value={this.state.location} 
                        placeholder='Address: you can use "go to my location" to detect'
                    />
                </div>
            </div>
        );
    }
});