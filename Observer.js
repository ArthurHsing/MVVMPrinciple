class Observer {
  constructor(data) {
    this.observe(data);
  }
  observe(data) {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        this.defineReactive(data, key, data[key]);
      });
    }
  }
  defineReactive(obj, key, value) {
    // 递归遍历
    this.observe(value);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: false,
      get() {
        // 订阅数据变化时，往Dep中添加观察者
        return value;
      },
      set: (newVal) => {
        // 如果新的值是一个对象，那么也对它进行观察
        this.observe(newVal);
        if (newVal !== value) {
          value = newVal;
        }
      }
    });
  }
}