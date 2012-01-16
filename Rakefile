require 'rake'

namespace :test do
  desc "Tests API's"
  task :api do
    system('NODE_ENV=test ./node_modules/expresso/bin/expresso ./test/api/v1/*.test.js')
  end
end

desc "test "
task :test => ["test:api"]