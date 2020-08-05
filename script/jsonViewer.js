class ViewerJson {
    constructor($parent, json) {
      let self = this;
      $parent.append("<div id='research'></div>");
      let $divResearch = $parent.children('#research');
  
      $divResearch.append("<input type='text' class='researchItem' value='name' placeholder='research'></input><span class='nbFound'></span>  <input type='button' class='search' value='Search'></input>  <input type='checkbox' class='exactly'>The exact word</input>");
      $divResearch.children('.researchItem').get()[0].addEventListener('focusout', function(e){self.research(e)})
      $divResearch.children('.search').get()[0].addEventListener('click', function(e){self.research(e)})
      $divResearch.children('.exactly').get()[0].addEventListener('click', function(e){self.research(e)})
  
      $parent.append("<div id='replace'></div>");
      let $divReplace = $parent.children('#replace');
  
      $divReplace.append("<input type='text' class='replacementItem' value='name' placeholder='research'></input>  <input type='button' class='replace' value='Replace'></input>");
      $divReplace.children('.replace').get()[0].addEventListener('click', function(e){self.replace(e)})
  
      self.jsonFile = json; //stocker le json du lien dans jsonFile
      //jsonFile = JSON.parse('["monday",null,"wednesday","thursday","friday","tuesday", {"key1": "value1", "key2": "value2", "key3": "value3", "key4": ["coucou1", "coucou2", "coucou3"]} ]');
      if (Array.isArray(self.jsonFile)){
        $parent.append('<ul id="ulRoot"><li><span class="expandable jsonArray">json</span>  <i class="expandAll fas fa-angle-double-down"></i></li></ul>');
      }else{
        $parent.append('<ul id="ulRoot"><li><span class="expandable jsonObject">json</span>  <i class="expandAll fas fa-angle-double-down"></i></li></ul>');
      }
      self.$ulRoot = $parent.children('ul');
      self.addNormaleEventToSpan(self.$ulRoot.children('li').children('span'));
      let imgList = $parent.find('i.expandAll');
      for (let i = 0; i < imgList.length; i++) {
        imgList[i].addEventListener("click", function(e){self.expendAllChild(e);}, true);
      }
      self.modificationIsPossible = true;
      self.result = null;
    }
  
    get json() {
      return this.jsonFile();
    }
  
    replace = function (e) {
      let self = this;
      let $this = $(e.target);
      let replaceValue = $this.parent().children('.replacementItem').val();
      if (self.result == null){
        alert("Make a research before.");
      }else{
        self.result.get().forEach((item, i) => {
          let $item = $(item);
          if (!($item.html() === replaceValue)){
            let initialValue = $item.html();
            $item.empty();
            $item.append(replaceValue);
            if ($item.hasClass('key')){
              let jsonValueOfKey = self.goToInJson($item);
              jsonValueOfKey[replaceValue] = jsonValueOfKey[initialValue];
              delete jsonValueOfKey[initialValue];
            }
            else if ($item.hasClass('value')){
              let jsonValueOfKey = self.goToInJson($item);
              let valuFormated = self.typeOfSpanValue($item);
              jsonValueOfKey[$item.parent().children(".key").html()] = valuFormated;
              $item.addClass("research");
            }
  
          }
        });
        console.log("self.jsonFile");
        console.log(self.jsonFile);
      }
    }
  
    research = function (e) {
      let self = this;
      let $this = $(e.target);
      let researchValue = $this.parent().children('.researchItem').val();
      self.$ulRoot.find("*").removeClass("research")
      $this.parent().children('.nbFound').empty();
      self.result = null;
      if (!(researchValue.length === 0)){
  
        //let result = self.$ulRoot.find("[html = '" + researchValue + "']");
        if ($this.parent().children('.exactly').is(':checked')){
          self.result = self.$ulRoot.find("span:contains('" + researchValue + "')").filter(function() {
            return $(this).text() === researchValue;
          }).addClass("research");
        }else{
          self.result = self.$ulRoot.find("span:contains('" + researchValue + "')").addClass("research");
        }
        self.result.get().forEach((item, i) => {
          let $item = $(item);
          let $iterator = $item;
          while(!($item.is(':visible'))){
            console.log($iterator);
            $iterator = $iterator.parent().parent();
            if(!($iterator.hasClass("active"))){
              $iterator.parent().children(".expandable").click();
            }
          }
        });
        $this.parent().children('.nbFound').append("*" + self.result.length)
      }
    }
  
    goToInJson = function (startSpan) {
      let self = this;
      let parentsArray = startSpan.parents('ul');
      let counter = parentsArray.length - 1;
      while (parentsArray[counter].id != 'ulRoot' && counter > 0){
        counter --;
      }
      counter --;
      let jsonValueOfKey = self.jsonFile;
      for(let position = counter - 1; position >= 0; position --) {
        jsonValueOfKey = jsonValueOfKey[parentsArray[position].parentElement.querySelector('span.expandable').innerHTML];
      }
      return jsonValueOfKey;
    }
  
    typeOfSpanValue = function ($span){
      $span.removeClass();
      $span.addClass("value");
      let spanValue = $span.html();
  
      if (!isNaN( parseInt(spanValue, 10))) {
        let value = parseInt(spanValue, 10)
        if (value.toString() == spanValue){
          $span.addClass("jsonNumber");
          return value;
        }else{
          $span.addClass("jsonString");
          return spanValue;
        }
      }
      else if (typeof spanValue == 'string'){
        if (spanValue.toLowerCase() === 'true' || spanValue.toLowerCase() === 'false'){
          $span.addClass("jsonBoolean");
  
          if(spanValue.toLowerCase() === 'true'){
            return true;
          }
          else {
            return false;
          }
        }
        else if (spanValue.toLowerCase() === 'null'){
          $span.addClass("jsonNull");
          return null;
        }
        else{
          $span.addClass("jsonString");
          return spanValue;
        }
      }
    }
  
  
    expand = function  (e) {
      let self = this;
  
      let $this = $(e.target);
      if( $this.parent().hasClass("editing") || !($this.hasClass("expandable"))){
        return;
      }
  
      if($this.parent().children('ul').length == 0) {
        let jsonValueOfKey = self.goToInJson($this);
        //vérifier si le truc sur lequel on a cliqué est un tableau ou un objet
        let htmlString = "<i class='addChild fas fa-plus'></i>"; //bouton pour ajouter des enfants
        if(typeof jsonValueOfKey[$this.html()] == 'object') {
          htmlString += self.constructHtmlFromKeyArray(Object.keys(jsonValueOfKey[$this.html()]), jsonValueOfKey[$this.html()]);
        }
        else if (typeof jsonValueOfKey == 'object'){
          htmlString += self.constructHtmlFromKeyArray(Object.keys(jsonValueOfKey), jsonValueOfKey);
        }
        let keyVar = "<ul class='nested'>" + htmlString + "</ul>";
        $this.parent().append(keyVar);
        $this.parent().children("ul.nested").toggleClass("active");
        $this.toggleClass("expandable-down");
  
        let spanList = $this.parent().children('ul').find('span.key');
        let i;
        for (i = 0; i < spanList.length; i++) {
          spanList[i].addEventListener("contextmenu", function(e){self.modify(e)}, false);
        }
        spanList = $this.parent().children('ul').find('span.value');
        for (i = 0; i < spanList.length; i++) {
          spanList[i].addEventListener("contextmenu", function(e){self.modify(e)}, false);
        }
        spanList = $this.parent().children('ul').find('span.expandable');
        for (i = 0; i < spanList.length; i++) {
          spanList[i].addEventListener("click", function(e){self.expand(e)}, false);
        }
        let imgList = $this.parent().children('ul').find('i.delete');
        for (i = 0; i < imgList.length; i++) {
          imgList[i].addEventListener("click", function(e){self.deleteLine(e)}, false);
        }
        imgList = $this.parent().children('ul').find('i.addChild');
        for (i = 0; i < imgList.length; i++) {
          imgList[i].addEventListener("click", function(e){self.addChild(e)}, false);
        }
        imgList = $this.parent().children('ul').find('i.expandAll');
        for (i = 0; i < imgList.length; i++) {
          imgList[i].addEventListener("click", function(e){self.expendAllChild(e)}, true);
        }
  
        $this.parent().children('ul').children('addChild');
      } else {
        if (e.clientX == 0 && e.clientY == 0 && e.layerX == 0 && e.layerY == 0 ){
          if (!$this.parent().children("ul.nested").hasClass("active")){
              $this.parent().children("ul.nested").toggleClass("active");
          }
          if (!$this.hasClass("expandable-down")){
              $this.toggleClass("expandable-down");
          }
        }
        else {
          $this.parent().children("ul.nested").toggleClass("active");
          $this.toggleClass("expandable-down");
        }
      }
    }
  
    expendAllChild = function (e){
      let $this = $(e.target);
      let self = this;
      $this.parent().children(".expandable").click();
      let tabOfChild = $this.parent().children("ul").children("li").children(".expandable");
      for (let i = 0; i < tabOfChild.length; i++){
        self.expendAllChildRec(tabOfChild[i]);
      }
    }
  
    expendAllChildRec = function ($spanToExpand){
      let self = this;
      $spanToExpand  = $($spanToExpand)
      if(!($spanToExpand.hasClass('expandable-down'))){
        $spanToExpand.click();
      }
        let tabOfChild = $spanToExpand.parent().children("ul").children("li").children(".expandable");
        for (let i = 0; i < tabOfChild.length; i++){
          self.expendAllChildRec(tabOfChild[i]);
        }
    }
  
    addChild = function (e){
      let self = this;
      if(self.modificationIsPossible == true) {
        self.modificationIsPossible = false;
        let $this = $(e.target);
  
        let textInputKey =  '<input type="text" id="newKey" name="lname" value=""></input>';
        let textInput =  '<input type="text" id="newValue" name="lname" value=""></input>  ';
        let buttonValidation = '<i id="validateButton" class="far fa-check-circle"></i>  ';
        let buttonCancellation = '<i id="cancelButton" class="far fa-window-close"></i>  ';
        let buttonIsObject = '<input type="button" id="isObject" value="{ }">  ';
        let buttonIsArray = '<input type="button" id="isArray" value="[ ]">  ';
        let lineToAdd;
        let isInArray = false;
        if ($this.parent().parent().children('.expandable').hasClass('jsonObject')){
          lineToAdd = '<li class="adding"><span class="key">Key : ' + textInputKey + '</span> : <span class="value"> Value : ' + textInput + buttonIsObject + buttonIsArray + buttonValidation + buttonCancellation + '</span></li>';
          isInArray = false;
        }
        else if ($this.parent().parent().children('.expandable').hasClass('jsonArray')){
          lineToAdd = '<li class="adding"><span class="key"></span> : <span class="value"> Value : ' + textInput + buttonIsObject + buttonIsArray + buttonValidation + buttonCancellation + '</span></li>';
          isInArray = true;
        }
        else{
          self.modificationIsPossible = true;
          return;
        }
  
        $this.after(lineToAdd);
        let $lineAdd = $this.parent().children(".adding");
  
        $lineAdd.children('.value').children('#cancelButton').get()[0].addEventListener("click", function() {$lineAdd.remove(); self.modificationIsPossible = true;});
  
        $lineAdd.children('.value').children('#validateButton').get()[0].addEventListener("click", function() {
            $lineAdd.removeClass("adding");
  
            let valueValue = $lineAdd.children('.value').children('#newValue').val();
            $lineAdd.children('.value').empty();
            $lineAdd.children('.value').append(valueValue);
            self.addNormaleEventToSpan($lineAdd.children('.value'));
  
            $lineAdd.append("     <i class='delete far fa-trash-alt'></i>");
            $lineAdd.children('.delete').get()[0].addEventListener("click", function(e){self.deleteLine(e)}, false);
  
            valueValue = self.typeOfSpanValue($lineAdd.children('.value'));
            if (isInArray){
              let jsonValueOfKey = self.goToInJson($lineAdd.children('.value'));
              jsonValueOfKey.push(valueValue);
  
              $lineAdd.children('.key').empty();
              $lineAdd.children('.key').append(jsonValueOfKey.length - 1 );
              self.addNormaleEventToSpan($lineAdd.children('.key'));
            }
            else{
              let keyValue = $lineAdd.children('.key').children('#newKey').val();
              $lineAdd.children('.key').empty();
              $lineAdd.children('.key').append(keyValue);
              self.addNormaleEventToSpan($lineAdd.children('.key'));
  
              let jsonValueOfKey = self.goToInJson($lineAdd.children('.key'));
              jsonValueOfKey[keyValue] = valueValue;
            }
            self.modificationIsPossible = true;
          });
  
          $lineAdd.children('.value').children('#isObject').get()[0].addEventListener("click", function() {
  
              if (isInArray){
                let jsonValueOfKey = self.goToInJson($lineAdd.children('.value'));
                jsonValueOfKey.push(JSON.parse('{}'));
  
                $lineAdd.children('.key').empty();
                $lineAdd.children('.key').append(jsonValueOfKey.length - 1 );
              }
              else{
                let keyValue = $lineAdd.children('.key').children('#newKey').val();
                $lineAdd.children('.key').empty();
                $lineAdd.children('.key').append(keyValue);
  
                let jsonValueOfKey = self.goToInJson($lineAdd.children('.key'));
                jsonValueOfKey[keyValue] = JSON.parse('{}');
              }
  
              $lineAdd.removeClass("adding");
              $lineAdd.children('.value').remove();
              $lineAdd.children('.key').addClass('expandable');
              $lineAdd.children('.key').addClass('jsonObject');
              self.addNormaleEventToSpan($lineAdd.children('.key'));
  
              $lineAdd.append(" {}    <i class='delete far fa-trash-alt'></i>");
              $lineAdd.children('.delete').get()[0].addEventListener("click", function(e){self.deleteLine(e)}, false);
  
              self.modificationIsPossible = true;
            });
  
            $lineAdd.children('.value').children('#isArray').get()[0].addEventListener("click", function() {
                if (isInArray){
                  let jsonValueOfKey = self.goToInJson($lineAdd.children('.value'));
                  jsonValueOfKey.push(JSON.parse('[]'));
  
                  $lineAdd.children('.key').empty();
                  $lineAdd.children('.key').append(jsonValueOfKey.length - 1 );
                }
                else{
                  let keyValue = $lineAdd.children('.key').children('#newKey').val();
                  $lineAdd.children('.key').empty();
                  $lineAdd.children('.key').append(keyValue);
  
                  let jsonValueOfKey = self.goToInJson($lineAdd.children('.key'));
                  jsonValueOfKey[keyValue] = JSON.parse('[]');
                }
                $lineAdd.removeClass("adding");
  
                $lineAdd.children('.value').remove();
                $lineAdd.children('.key').addClass('expandable');
                $lineAdd.children('.key').addClass('jsonArray');
                self.addNormaleEventToSpan($lineAdd.children('.key'));
  
                $lineAdd.append(" []    <i class='delete far fa-trash-alt'></i>");
                $lineAdd.children('.delete').get()[0].addEventListener("click", function(e){self.deleteLine(e)}, false);
  
  
                self.modificationIsPossible = true;
              });
      }
    }
  
    modify = function (e) {
      let self = this;
      e.preventDefault();
      if(self.modificationIsPossible == true) {
        self.modificationIsPossible = false;
        let $this = $(e.target);
  
        //$this.get()[0].removeEventListener('click', this.expand, false); //no expansion during modification
        //$this.get()[0].removeEventListener('contextmenu', this.modify, false); //no contextmenu (right click) during modification
        //$this.get()[0].getEventListeners().click.forEach((e)=>{e.remove()});
        $this.parent().addClass("editing");
  
        let initialValue = $this.html();
        let textInput =  '<input type="text" id="newValue" name="lname" value=' + initialValue + '> </input>';
        let buttonInputValidation = '<i id="validateButton" class="far fa-check-circle"></i>  ';
        let buttonInputCancellation = '<i id="cancelButton" class="far fa-window-close"></i>  ';
        //onclick="cancelModification(\'' + $this.get()[0] + '\',\'' + $this.html() + '\')"
        $this.empty();
        $this.append(textInput);
        $this.append(buttonInputValidation);
        $this.append(buttonInputCancellation);
        $this.children('#cancelButton').get()[0].addEventListener("click", function() {self.cancelModification($this, initialValue);});
        if($this.hasClass("key")){
          $this.children('#validateButton').get()[0].addEventListener("click", function() {self.validateKeysModification($this, initialValue);});
        }else{
          $this.children('#validateButton').get()[0].addEventListener("click", function() {self.validateValuesModification($this, initialValue);});
        }
      }
      else {
        alert("You can modify one thing at a time.");
      }
  
    }
  
    validateKeysModification = function ($this, initialValue) {
      let self = this;
      newValue = $("#newValue").val();
      $this.empty();
      $this.append(newValue);
      self.addNormaleEventToSpan($this)
      let jsonValueOfKey = self.goToInJson($this);
      if(newValue != initialValue) {
        jsonValueOfKey[newValue] = jsonValueOfKey[initialValue];
        delete jsonValueOfKey[initialValue];
      }
      $this.parent().removeClass("editing");
      self.modificationIsPossible = true;
    }
  
    validateValuesModification = function ($this, initialValue) {
      let self = this;
      let newValue = $("#newValue").val();
      $this.empty();
      $this.append(newValue);
      self.addNormaleEventToSpan($this)
      newValue = self.typeOfSpanValue($this);
  
      let jsonValueOfKey = self.goToInJson($this);
      jsonValueOfKey[$this.parent().children(".key").html()] = newValue;
  
      $this.parent().removeClass("editing");
      self.modificationIsPossible = true;
    }
  
    cancelModification = function ($this, initialValue) {
      let self = this;
      $this.empty();
      $this.append(initialValue);
      self.addNormaleEventToSpan($this)
      $this.parent().removeClass("editing");
      self.modificationIsPossible = true;
    }
  
    addNormaleEventToSpan = function ($span){
      let self = this;
      if($span.hasClass("expandable")) {
  
        $span.get()[0].addEventListener("click", function(e){self.expand(e);}, false);
      }
      if($span.hasClass("key")){
        $span.get()[0].addEventListener("contextmenu", function(e){self.modify(e);}, false);
      }
      if($span.hasClass("value")){
        $span.get()[0].addEventListener("contextmenu", function(e){self.modify(e);}, false);
      }
    }
  
    deleteLine = function (e){
      let self = this;
      if (self.modificationIsPossible){
        let $this = $(e.target);
        let keytodelete = self.goToInJson($this.parent().children('span.key'));
        delete keytodelete[$this.parent().children('span.key').html()];
        $this.parent().remove();
      }
    }
  
    constructHtmlFromKeyArray = function (keysArray, keysJson) {
      let htmlString = "";
      let counter = 0; //for the span object id
      keysArray.forEach(key => {
        let keyValue = keysJson[key];
        let keyVar;
  
        if(typeof keyValue == 'object') {
          if(keyValue == null) {
            keyVar = "<li>" + "<span class='key'>" + key + "</span>" + " : " + "<span class='value jsonNull'>" + keyValue + "</span>";
          }
          else {
            if (Array.isArray(keyValue)){
              keyVar = "<li><span class='expandable jsonArray key'>" + key + "</span>" + " : []  <i class='expandAll fas fa-angle-double-down'></i>";
            }
            else {
              keyVar = "<li><span class='expandable jsonObject key'>" + key + "</span>" + " : {}  <i class='expandAll fas fa-angle-double-down'></i>";
            }
  
          }
        }
        else if(typeof keyValue == 'string') {
          keyVar = "<li>" + "<span class='key'>" + key + "</span>" + " : " + "<span class='value jsonString'>" + keyValue + "</span>";
        }
        else if(typeof keyValue == 'number') {
          keyVar = "<li>" + "<span class='key'>" + key + "</span>" + " : " + "<span class='value jsonNumber'>" + keyValue + "</span>";
        }
        else if(typeof keyValue == 'boolean') {
          keyVar = "<li>" + "<span class='key'>" + key + "</span>" + " : " + "<span class='value jsonBoolean'>" + keyValue + "</span>";
        }
        keyVar += "  <i class='delete far fa-trash-alt'></i></li>";
        htmlString += keyVar;
      });
      return htmlString;
    }
}