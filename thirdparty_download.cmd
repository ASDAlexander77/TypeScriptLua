git submodule init
git submodule update
echo /src > .git\modules\thirdparty\Babylon.js\info\sparse-checkout
cd thirdparty\Babylon.js
git config core.sparseCheckout true
git checkout -b v3.3.0
