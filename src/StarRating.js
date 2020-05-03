import "./StarRating.scss";

const componentTemplate = document.createElement('template');
componentTemplate.innerHTML = `
<div class="star-rating">
  <div class="star-rating__stars-empty"></div>
  <div class="star-rating__stars-full"></div>
</div>`;

const starTemplate = document.createElement('template');
starTemplate.innerHTML = `<span class="star"></span>`;

class StarRating extends HTMLElement {
  constructor(){
    super();

    this._clonedNode = componentTemplate.content.cloneNode(true);

    this._fullStars = this._clonedNode.querySelector('.star-rating__stars-full');
    this._emptyStars = this._clonedNode.querySelector('.star-rating__stars-empty');

    this._spacingRatioOfStarWidth = 0.6;

    // attribute reflected values
    this._numStars = 5;
    this._maxValue = 5;
    this._value = 5;
  }

  connectedCallback() {
    this.updateVisibleStars(this.value);

    // init internal attribute values
    this._numStars = this['num-stars'];
    this._maxValue = this['max-value'];
    this._value = this['value'];

    let starWidthInPx = this.getStarWidthInPx();
    let spacingInPx = this.getSpacingInPx(starWidthInPx);

    // we need to create the required stars. We only do this once in this method
    // the only thing we need to worry about changing is the rating value itself
    for(let i = 0; i < this._numStars; i++){
      let star = starTemplate.content.cloneNode(true).firstChild;

      let starWidthFactor = this.getWidthFactorForStar(i + 1);

      if(starWidthFactor > 0){
        star.style.width = `${starWidthInPx*starWidthFactor}px`;
      }
      else{
        star.style.width = 0;
      }

      star.style.height = `${starWidthInPx}px`;

      if(i > 0){
        star.style.marginLeft = `${spacingInPx/2}px`;
      }

      if(i < this._numStars - 1){
        star.style.marginRight = `${spacingInPx/2}px`;
      }

      this._fullStars.appendChild(star);
    }

    for(let i = 0; i < this._numStars; i++){
      let star = starTemplate.content.cloneNode(true).firstChild;
      star.style.width = star.style.height = `${starWidthInPx}px`;

      if(i > 0){
        star.style.marginLeft = `${spacingInPx/2}px`;
      }

      if(i < this._numStars - 1){
        star.style.marginRight = `${spacingInPx/2}px`;
      }

      this._emptyStars.appendChild(star);
    }

    // we base the height on the width and the height will always adjust when the width changes
    // We need to take the number of stars and maintain a proportion. The spacing btwn stars
    // will be a fixed proportion and then the stars themselves divide the remaining space.
    // this sizing needs to be recalculated each time.
    // We use margin-left on the first star, margin-right on the last star and margin-left and
    // margin-right on remaining stars to set the spacing between stars
    this.style.height = `${25*(this.clientWidth/137)}px`;

    this.appendChild(this._clonedNode);
  }

  static get observedAttributes() {
    return ['value', 'max-value', 'num-stars', 'class', 'style'];
  }
  
  attributeChangedCallback(attrName, oldValue, newValue) {
    if(attrName == 'class' || attrName == 'style'){
      this.style.height = `${25*(this.clientWidth/137)}px`;
      return;
    }

    if (newValue !== oldValue) {
      this[attrName] = newValue;
    }
  }

  get value() {
    return this.getAttribute('value');
  }

  get maxValue() {
    return this.getAttribute('max-value');
  }

  get numStars() {
    return this.getAttribute('num-stars');
  }

  // this will basically update our internal representation of the attribute
  set value(val) {
    var floatVal = parseFloat(val);
    if(isNaN(floatVal ) || floatVal < 0){
      floatVal = 0;
    }
    else if(floatVal > 5){
      floatVal = 5;
    }

    this._value = floatVal;

    this.updateVisibleStars(floatVal);
  }

  // this will basically update our internal representation of the attribute
  set maxValue(val) {
    var intVal = parseInt(val);
    if(isNaN(intVal ) || intVal < 0){
      // default value
      this._maxValue = 5;
    }

    this._maxValue = intVal;
  }

  // this will basically update our internal representation of the attribute
  set numStars(val) {
    var intVal = parseInt(val);
    if(isNaN(intVal ) || intVal < 0){
      // default value
      this._numStars = 5;
    }

    this._numStars = intVal;
  }

  updateVisibleStars(val){
    //this._fullStars.style.width = `${val*20}%`;
  }

  getStarWidthInPx(){
    return this.clientWidth/(this._numStars + this._spacingRatioOfStarWidth*(this._numStars - 1));
  }

  getSpacingInPx(starWidth){
    return starWidth*this._spacingRatioOfStarWidth;
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