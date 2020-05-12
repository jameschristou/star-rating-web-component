import "./StarRating.scss";

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

class StarRating extends HTMLElement {
  constructor(){
    super();

    this._clonedNode = componentTemplate.content.cloneNode(true);

    this._fullStars = this._clonedNode.querySelector('.star-rating__stars-full');
    this._emptyStars = this._clonedNode.querySelector('.star-rating__stars-empty');

    this._spacingRatioOfStarWidth = 0.6;

    // attribute reflected values
    this._numStars = DEFAULT_NUM_STARS;
    this._maxValue = DEFAULT_MAX_VALUE;
    this._value = 0;
    this._currentComponentWidth = 0;

    this._starWidthInPx = 0;
    this._spacingInPx = 0;
  }

  connectedCallback() {
    this.validateAttributes();

    this._starWidthInPx = this.getStarWidthInPx();
    this._spacingInPx = this.getSpacingInPx();

    if(this._currentComponentWidth == 0){
      this._currentComponentWidth = this.getComponentWidthInPx();
    }

    // we need to create the required stars. We only do this once in this method
    // the only thing we need to worry about changing is the rating value itself
    for(let i = 0; i < this._numStars; i++){
      let fullStar = starTemplate.content.cloneNode(true).firstChild;
      let emptyStar = starTemplate.content.cloneNode(true).firstChild;

      this.updateFullStar(fullStar, i);
      this.updateStar(emptyStar, i);

      this._fullStars.appendChild(fullStar);
      this._emptyStars.appendChild(emptyStar);
    }

    window.addEventListener("resize",  e => {
      var newWidth = this.getComponentWidthInPx();
      
      if(newWidth != 0 && this._currentComponentWidth != newWidth){
        this._currentComponentWidth = newWidth;

        console.log('resizing stars');
        this.updateStars();
      }
    });

    this.style.height = `${this._starWidthInPx}px`;

    this.appendChild(this._clonedNode);
  }

  updateStars(){
    this.validateAttributes();

    let starWidthInPx = this.getStarWidthInPx();

    if(typeof starWidthInPx === 'undefined' || starWidthInPx == 0) return;

    this._starWidthInPx = starWidthInPx;
    this._spacingInPx = this.getSpacingInPx();

    for(let i = 0; i < this._fullStars.children.length; i++){
      let fullStar = this._fullStars.children[i];
      let emptyStar = this._emptyStars.children[i];

      this.updateFullStar(fullStar, i);

      // empty stars
      this.updateStar(emptyStar, i);
    }

    this.style.height = `${starWidthInPx}px`;
  }

  updateStar(star, starIndex){
    // empty stars
    star.style.height = `${this._starWidthInPx}px`;
    star.style.width = `${this._starWidthInPx}px`;

    if(starIndex > 0){
      star.style.marginLeft = `${this._spacingInPx/2}px`;
    }

    if(starIndex < this._numStars - 1){
      star.style.marginRight = `${this._spacingInPx/2}px`;
    }
  }

  updateFullStar(star, index){
    this.updateStar(star, index);

    let starWidthFactor = this.getWidthFactorForStar(index + 1);

    if(starWidthFactor > 0){
      star.style.width = `${this._starWidthInPx*starWidthFactor}px`;
    }
    else{
      star.style.width = 0;
    }
  }

  static get observedAttributes() {
    return ['value', 'max-value', 'num-stars', 'class', 'style'];
  }
  
  attributeChangedCallback(attrName, oldValue, newValue) {
    if(attrName == 'class' || attrName == 'style'){
      this.style.height = `${this.getStarWidthInPx()}px`;
      return;
    }

    if(newValue == oldValue) return;

    this[attrName] = newValue;

    // reflecting attributes which have hyphens in attribute name. We need this code
    // because custom elements do not automatically reflect such attributes to property
    // names. We use hyphenated names because this is convention and we can't use
    // camelcased attribute names because the HTML standard does not support them
    if(attrName == 'max-value'){
      this.maxValue = newValue;
    }

    if(attrName == 'num-stars'){
      this.numStars = newValue;
    }
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

    this.updateStars();
  }

  // property for setting the max-value attribute
  set maxValue(val) {
    var intVal = parseInt(val);
    if(isNaN(intVal ) || intVal < 0){
      // default value
      this._maxValue = DEFAULT_MAX_VALUE;
    }

    this._maxValue = intVal;
  }

  // property for setting the num-stars attribute
  set numStars(val) {
    var intVal = parseInt(val);
    if(isNaN(intVal ) || intVal < 0){
      // default value
      this._numStars = DEFAULT_NUM_STARS;
    }

    this._numStars = intVal;
  }

  validateAttributes(){
    // value cannot be greater than maxValue
    if(this._value > this._maxValue){
      this.value = this._maxValue;
    }
  }

  getComponentWidthInPx(){
    // use this rather than this.clientWidth because we need greater than whole number precision
    // otherwise our stars may not fit correctly if container width is 103.6px but clientWidth tells
    // us its 104px
    let rect = this.getBoundingClientRect();
    if(!rect){
      return 0;
    }

    return rect.width;
  }

  getStarWidthInPx(){
    return this.getComponentWidthInPx()/(this._numStars + this._spacingRatioOfStarWidth*(this._numStars - 1));
  }

  getSpacingInPx(){
    // we stick to 1 decimal point due to an issue on firefox which seems to be make the stars wrap if we're too precise
    return Math.trunc(this._starWidthInPx*this._spacingRatioOfStarWidth*10)/10;
  }

  getWidthFactorForStar(starNumber){
    let valuePerStar = this._maxValue/this._numStars;

    if(valuePerStar*starNumber <= this._value) return 1;

    // some proportion of current star
    if(valuePerStar*starNumber > this._value && valuePerStar*(starNumber - 1) < this._value) return (this._value - valuePerStar*(starNumber - 1))/valuePerStar;

    return 0;
  }
}

customElements.define('star-rating', StarRating);

export default StarRating;