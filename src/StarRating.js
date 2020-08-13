const componentTemplate = document.createElement('template');
componentTemplate.innerHTML = `
<div class="star-rating">
  <div class="star-rating__stars-empty"></div>
  <div class="star-rating__stars-full"></div>
</div>`;

const starTemplate = document.createElement('template');
starTemplate.innerHTML = `<span class="star"></span>`;

const DEFAULT_NUM_STARS = 5;
const DEFAULT_MAX_VALUE = 5;

function isIE() { 
  var ua = window.navigator.userAgent; 
  return ua.indexOf('Trident/') > 0 || ua.indexOf('MSIE ') > 0;
} 

class StarRating extends HTMLElement {
  constructor(){
    super();

    this._clonedNode = componentTemplate.content.cloneNode(true);

    this._fullStars = this._clonedNode.querySelector('.star-rating__stars-full');
    this._emptyStars = this._clonedNode.querySelector('.star-rating__stars-empty');

    this._spacingRatioOfStarWidth = 0.6;

    // attribute reflected values
    this._numStars;
    this._maxValue;
    this._value = 0;

    this._currentComponentWidth = 0;

    this._starWidthInPercentage = 0;
    this._spacingWidthInPercentage = 0;

    this._isInitialised = false;

    // used only for IE
    this._starWidthInPx = 0;
    this._isIE = isIE();
  }

  connectedCallback() {
    this._updateStars();

    window.addEventListener("resize",  e => {
      var newWidth = this._getComponentWidthInPx();
      
      if(newWidth != 0 && this._currentComponentWidth != newWidth){
        this._currentComponentWidth = newWidth;
        this._starWidthInPx = this._getStarWidthInPx();

        this.style.height = `${this._starWidthInPx}px`;

        if(this._isIE){
          // if IE then we need to listen out for window resize just in case our container width
          // changes due to passing through a breakpoint. This will mean having to resize star background
          this._updateStars();
        }
      }
    });

    this.appendChild(this._clonedNode);
    this._isInitialised = true;
  }

  static get observedAttributes() {
    return ['value', 'max-value', 'num-stars', 'class', 'style'];
  }
  
  attributeChangedCallback(attrName, oldValue, newValue) {
    if(attrName == 'class' || attrName == 'style'){
      this.style.height = `${this._getStarWidthInPx()}px`;
      return;
    }

    if(newValue == oldValue) return;

    // reflecting attributes which have hyphens in attribute name. We need this code
    // because custom elements do not automatically reflect such attributes to property
    // names. We use hyphenated names because this is convention and we can't use
    // camelcased attribute names because the HTML standard does not support them
    if(attrName == 'max-value'){
      // use the property setters
      this.maxValue = newValue;
      return;
    }

    if(attrName == 'num-stars'){
      // use the property setters
      this.numStars = newValue;
      return;
    }

    this[attrName] = newValue;
  }

  get value() {
    return this._value;
  }

  get maxValue() {
    return this._maxValue;
  }

  get numStars() {
    return this._numStars;
  }

  // property for setting the value attribute
  set value(val) {
    var floatVal = parseFloat(val);
    if(isNaN(floatVal ) || floatVal < 0){
      floatVal = 0;
    }

    this._value = floatVal;

    this._resetStars();
  }

  // property for setting the max-value attribute
  set maxValue(val) {
    var intVal = parseInt(val);
    if(isNaN(intVal) || intVal < 0){
      // default value
      this._maxValue = DEFAULT_MAX_VALUE;
    }

    this._maxValue = intVal;

    this._resetStars();
  }

  // property for setting the num-stars attribute
  set numStars(val) {
    var intVal = parseInt(val);
    if(isNaN(intVal) || intVal < 0){
      // default value
      this._numStars = DEFAULT_NUM_STARS;
    }

    this._numStars = intVal;

    this._resetStars();
  }

  _resetStars(){
    // if this component is not yet initialised then don't go updating elements
    // (_updateStars gets called in parallel to connectedCallback due to value been set)
    // might need an explicit this._isInitialised to handle this properly
    if(!this._isInitialised) return;

    this._updateStars();
  }

  _updateStars(){
    this._validateAttributes();

    let starWidthInPx = this._getStarWidthInPx();

    if(typeof starWidthInPx === 'undefined' || starWidthInPx == 0) return;

    this._starWidthInPx = starWidthInPx;

    this._starWidthInPercentage = this._getStarWidthAsPercentage();
    this._spacingWidthInPercentage = this._getSpacingWidthAsPercentage();

    // make sure the nodes are empty otherwise we might be adding children again if the element
    // is reattached to the DOM (this is common in Angular)
    // TODO: look at replacing this with using MutationObserver
    // https://medium.com/patternfly-elements/more-resilientweb-components-in-angular-or-anywhere-else-with-mutationobserver-72a91cd7cf22
    this._fullStars.innerHTML = "";
    this._emptyStars.innerHTML = "";

    // we need to create the required stars. Star creation only happens once
    for(let i = 0; i < this._numStars; i++){
      let fullStar = starTemplate.content.cloneNode(true).firstChild;
      let emptyStar = starTemplate.content.cloneNode(true).firstChild;

      this._updateFullStar(fullStar, i);
      this._updateStar(emptyStar, i);

      this._fullStars.appendChild(fullStar);
      this._emptyStars.appendChild(emptyStar);
    }

    this.style.height = `${this._starWidthInPx}px`;
  }

  _updateStar(star, starIndex){
    // empty stars
    star.style.width = `${this._starWidthInPercentage}%`;

    if(this._isIE){
      star.style.backgroundSize = `${this._starWidthInPx}px ${this._starWidthInPx}px`;
    }

    if(starIndex > 0){
      star.style.marginLeft = `${this._spacingWidthInPercentage/2}%`;
    }

    if(starIndex < this._numStars - 1){
      star.style.marginRight = `${this._spacingWidthInPercentage/2}%`;
    }
  }

  _updateFullStar(star, index){
    this._updateStar(star, index);

    let starWidthFactor = this._getWidthFactorForStar(index + 1);

    if(starWidthFactor > 0){
      star.style.width = `${this._starWidthInPercentage*starWidthFactor}%`;
    }
    else{
      star.style.width = 0;
    }
  }

  _validateAttributes(){
    if(!this._maxValue) this._maxValue = DEFAULT_MAX_VALUE;

    // value cannot be greater than maxValue
    if(this._value > this._maxValue){
      this._value = this._maxValue;
    }

    if(!this._numStars) this._numStars = DEFAULT_NUM_STARS;
  }

  _getComponentWidthInPx(){
    // use this rather than this.clientWidth because we need greater than whole number precision
    // otherwise our stars may not fit correctly if container width is 103.6px but clientWidth tells
    // us its 104px
    let rect = this.getBoundingClientRect();
    if(!rect){
      return 0;
    }

    return rect.width;
  }

  _getStarWidthInPx(){
    // the stars don't quite work when we have non integer values for the star width so we bump down to the nearest integer for IE.
    // Otherwise we keep one decimal place which works well for all the modern browsers
    let truncFactor = this._isIE ? 1 : 10;

    return Math.trunc(this._getComponentWidthInPx()*truncFactor/(this._numStars + this._spacingRatioOfStarWidth*(this._numStars - 1)))/truncFactor;
  }

  _getStarWidthAsPercentage(){
    // the stars don't quite work when we have non integer values for the star width so we bump down to the nearest integer for IE.
    // Otherwise we keep one decimal place which works well for all the modern browsers
    let truncFactor = this._isIE ? 1 : 10;

    //return Math.trunc(this.getComponentWidthInPx()*truncFactor/(this._numStars + this._spacingRatioOfStarWidth*(this._numStars - 1)))/truncFactor;
    return Math.trunc(100*truncFactor/(this._numStars + this._spacingRatioOfStarWidth*(this._numStars - 1)))/truncFactor;
  }

  _getSpacingWidthAsPercentage(){
    // we stick to 1 decimal point due to an issue on firefox which seems to be make the stars wrap if we're too precise
    return Math.trunc(this._starWidthInPercentage*this._spacingRatioOfStarWidth*10)/10;
  }

  // works out how much of the current full star should be filled
  _getWidthFactorForStar(starNumber){
    let valuePerStar = this._maxValue/this._numStars;

    if(valuePerStar*starNumber <= this._value){
      return 1;
    }

    // some proportion of current star
    if(valuePerStar*starNumber > this._value && valuePerStar*(starNumber - 1) < this._value) {
      return (this._value - valuePerStar*(starNumber - 1))/valuePerStar;
    }

    return 0;
  }
}

customElements.define('star-rating', StarRating);

export default StarRating;