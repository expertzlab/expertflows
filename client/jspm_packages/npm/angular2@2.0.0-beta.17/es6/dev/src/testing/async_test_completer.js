/* */ 
"format esm";
import { PromiseCompleter } from 'angular2/src/facade/promise';
/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
export class AsyncTestCompleter {
    constructor() {
        this._completer = new PromiseCompleter();
    }
    done(value) { this._completer.resolve(value); }
    fail(error, stackTrace) { this._completer.reject(error, stackTrace); }
    get promise() { return this._completer.promise; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfdGVzdF9jb21wbGV0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXhCTElCclZSLnRtcC9hbmd1bGFyMi9zcmMvdGVzdGluZy9hc3luY190ZXN0X2NvbXBsZXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sNkJBQTZCO0FBRTVEOztHQUVHO0FBQ0g7SUFBQTtRQUNVLGVBQVUsR0FBRyxJQUFJLGdCQUFnQixFQUFPLENBQUM7SUFNbkQsQ0FBQztJQUxDLElBQUksQ0FBQyxLQUFXLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXJELElBQUksQ0FBQyxLQUFXLEVBQUUsVUFBbUIsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXJGLElBQUksT0FBTyxLQUFtQixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZUNvbXBsZXRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9wcm9taXNlJztcblxuLyoqXG4gKiBJbmplY3RhYmxlIGNvbXBsZXRlciB0aGF0IGFsbG93cyBzaWduYWxpbmcgY29tcGxldGlvbiBvZiBhbiBhc3luY2hyb25vdXMgdGVzdC4gVXNlZCBpbnRlcm5hbGx5LlxuICovXG5leHBvcnQgY2xhc3MgQXN5bmNUZXN0Q29tcGxldGVyIHtcbiAgcHJpdmF0ZSBfY29tcGxldGVyID0gbmV3IFByb21pc2VDb21wbGV0ZXI8YW55PigpO1xuICBkb25lKHZhbHVlPzogYW55KSB7IHRoaXMuX2NvbXBsZXRlci5yZXNvbHZlKHZhbHVlKTsgfVxuXG4gIGZhaWwoZXJyb3I/OiBhbnksIHN0YWNrVHJhY2U/OiBzdHJpbmcpIHsgdGhpcy5fY29tcGxldGVyLnJlamVjdChlcnJvciwgc3RhY2tUcmFjZSk7IH1cblxuICBnZXQgcHJvbWlzZSgpOiBQcm9taXNlPGFueT4geyByZXR1cm4gdGhpcy5fY29tcGxldGVyLnByb21pc2U7IH1cbn1cbiJdfQ==