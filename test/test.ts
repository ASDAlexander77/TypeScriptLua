import './JS';

function __decorate (
    decors: any[], proto: any, propertyName: string, descriptorOrParameterIndex: any | undefined | null) {
    const isClassDecorator = propertyName === undefined;
    const isMethodDecoratorOrParameterDecorator = descriptorOrParameterIndex !== undefined;

    let protoOrDescriptorOrParameterIndex = isClassDecorator
        ? proto
        : null === descriptorOrParameterIndex
            ? descriptorOrParameterIndex = Object.getOwnPropertyDescriptor(proto, propertyName)
            : descriptorOrParameterIndex;

    for (let l = decors.length - 1; l >= 0; l--) {
        const decoratorItem = decors[l];
        if (decoratorItem) {
            protoOrDescriptorOrParameterIndex =
                (isClassDecorator
                    ? decoratorItem(protoOrDescriptorOrParameterIndex)
                    : isMethodDecoratorOrParameterDecorator
                        ? decoratorItem(proto, propertyName, protoOrDescriptorOrParameterIndex)
                        : decoratorItem(proto, propertyName))
                || protoOrDescriptorOrParameterIndex;
        }
    }

    if (isMethodDecoratorOrParameterDecorator && protoOrDescriptorOrParameterIndex) {
        Object.defineProperty(proto, propertyName, protoOrDescriptorOrParameterIndex);
    }

    return protoOrDescriptorOrParameterIndex;
}

function log(target: Function, key: string, value: any) {

    // target === C.prototype
    // key === "foo"
    // value === Object.getOwnPropertyDescriptor(C.prototype, "foo")

    return {
        value: function (...args: any[]) {
            console.log(`Call: ...`);

            return 2;
        }
    };
}

class C {
    @log
    foo(n: number) {
        return n * 2;
    }
}

const c = new C();
const r = c.foo(23);

console.log(r);

module Test1 {
    function log1(key: string, value: any) {
        console.log(`Call: ...`);
    }
}

log1("test2", "test3");
