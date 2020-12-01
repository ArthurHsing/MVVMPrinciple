class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    // 先把旧值保存起来
    this.oldVal = this.getOldVal()
  }
  getOldVal() {
    Dep.target = this;
    // 当这里再getVal的时候，就会进入obj的get拦截中，当前观察者this就被添加到Dep实例的subs中了
    const oldVal = compileUtil.getVal(this.expr, this.vm);
    Dep.target = null;
    return oldVal;
  }
  update() {
    const newVal = compileUtil.getVal(this.expr, this.vm);
    // 判断该元素上绑定的数据有没有变化，expr是获取数据的点点点表达式
    if (newVal !== this.oldVal) {
      this.cb(newVal);
    }
  }
}

class Dep {
  constructor() {
    this.subs = [];
  }
  // 收集观察者
  addSub(watcher) {
    this.subs.push(watcher);
  }
  // 通知观察者去更新
  notify() {
    this.subs.forEach(w => w.update());
  }
}

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
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: false,
      get() {
        // 订阅数据变化时，往Dep中添加观察者
        // Dep.target是在编译模板时，调用new Watcher时所创建的，里面有一个getOldVal方法，在这个方法中，会使Dep.target为当前的watcher实例，并且再次取值时会进入到
        // 当前的get拦截中，这时就会向Dep实例中添加那个观察者。
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set: (newVal) => {
        // 如果新的值是一个对象，那么也对它进行观察
        this.observe(newVal);
        if (newVal !== value) {
          value = newVal;
          // 告诉Dep通知变化
          dep.notify();
        }
      }
    });
  }
}