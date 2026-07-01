#include <iostream>
#include <memory>
using namespace std;

// 产品基类
class Product {
public:
    virtual void use() = 0;
    virtual ~Product() {}
};

class ProductA : public Product {
public:
    void use() override { cout << "Using Product A" << endl; }
};

class ProductB : public Product {
public:
    void use() override { cout << "Using Product B" << endl; }
};

// 工厂类
class Factory {
public:
    enum ProductType { TYPE_A, TYPE_B };

    static unique_ptr<Product> create(ProductType type) {
        switch (type) {
            case TYPE_A: return make_unique<ProductA>();
            case TYPE_B: return make_unique<ProductB>();
            default: return nullptr;
        }
    }
};

int main() {
    auto p1 = Factory::create(Factory::TYPE_A);
    auto p2 = Factory::create(Factory::TYPE_B);
    p1->use();
    p2->use();
    return 0;
}
