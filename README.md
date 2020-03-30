# reactive-generic-storage
Storage wrapper on top of browser storage apis. you can store data in browser storage (LocalStorage, SessionStorage) or use memory. it support key based ttl (time to live), namespacing, custom serielization and deserielization.

## Features
* Support browser storage (LocalStorage, SessionStorage)
* Support in-memory storage
* Define TTL for each key separately
* Support namespacing to prevent key conflict 
* Support Custom Serialization/Deserialization

## Installation
```bash
npm install reactive-generic-storage

yarn add reactive-generic-storage
```

## Usage
```javascript
import createStore from "reactive-generic-storage";

const store = createStore();

const foo = {
  bar: "bar"
};

store.set("foo", foo);

function logFooChanges({ key, oldValue, newValue }) {
  console.log(`bar property of ${key} has changed from ${oldValue} to ${newValue.bar}`);
}

store.on("foo", logFooChanges);

foo.bar = "bar1"
store.set("foo", foo)
// CONSOLE LOG: bar property of foo changed from bar to bar1

```


## API

### createStore(config)

#### config
Type: `Object`

#### returns
Type: `Object`

for see object property see [Store](#store)

#### config?.store
Type: `String`<br>
Default: `ls`

type of store you want to use. It should be one of the following

1. ls (localStorage)
2. ss (sessionStorage)
3. memory (in-memory storage)

#### config?.namespace
Type: `String`

Default: `rgs`

use for key prefix to prevent key conflict

#### config?.serialize
Type: `function(value): string`<br>
Default: JSON.stringify

used for serialization of value that should store in browser storage

**Example**
```javascript
const store = createStore({
  serialize: (value) => JSON.stringify(value, null, 2)
})
```

#### config?.deserialize
Type: `function(serializedData): any`<br>
Default: JSON.parse

used for deserialization of data that retrieved from browser storage


### Store

#### store.get
Type: `function(key): value|undefined`

retrive `value` of `key` that stored in storage. if key not present it returns `undefined`

#### store.set
Type: `function(key,value,[option])`

store value in storage with specified key.

##### option.ttl

Type: `number|undefined`<br>
Default: `undefined`

milliseconds before key expired

### store.remove
Type: `function(key): undefined`

remove specified key from storage

### store.clear
Type: `function(): undefined`

remove all keys from storage

### store.keys
Type: `function() : [string]`

return all keys in storage

### store.on
Type: `function(handler) : function`

set a handler on storage changes. it called on every changes.
return a function to remove handler from storage listeners

Type: `function(key,handler) : function`

set a handler for specified key changes. it called whenever key's value changed in storage.
by calling function with same key and diffrent handler. multiple handler set for key changes
return a function to remove handler from specified key listeners
**Notice: mulltiple call with same handler cuase mulltiple handler calls on changes

### store.off
Type: `function() : undefined`

remove all keys handlers

Type: `function(handler) : undefined`

remove specified handler that set on storage

Type: `function(key) : undefined`

remove all handlers on specified key

Type: `function(key,handler) : undefined`

remove specified handler on specified key

### store.destroy
Type: `function(): undefined`

reactivity will be off. all keys handlers will remove and storage will not synce between tabs anymore 


