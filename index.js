var gcloud = require('gcloud');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var jsonfile = require('jsonfile');
var json2csv = require('json2csv');

// useage
// node export-google-datastore -k keyfile -p project -f format -d datakind -o outfile

var keyfile = argv.k;
var project = argv.p;
var kind = argv.d;
var format = (typeof argv.f === 'undefined') ? 'json' : argv.f;
var outfile = (typeof argv.o === 'undefined') ? 'out.'+format : argv.o;

var err = false;
if(typeof keyfile == 'undefined'){
  err = true;
  console.error('You must supply a keyfile for authentication. Use -k <keyfile>');
}

if(typeof project == 'undefined'){
  err = true;
  console.error('You must supply the project ID. Use -p <projectid>');
}

if(typeof kind == 'undefined'){
  err = true;
  console.error('You must supply the kind. Use -d <kind>');
}
if(err){
  return;
}

var datastore = gcloud.datastore({
  projectId: project,
  keyFilename: keyfile
});

var query = datastore.createQuery(kind);

var result = [];
query.run()
  .on('data', function(entity) {  result.push(entity.data); })
  .on('end', function() {
    if(format == 'json'){
      jsonfile.writeFile(outfile, result);
    }
    if(format == 'csv'){
      json2csv({data:result}, function(err, csv){
        fs.writeFile(outfile, csv);
      });
    }
  });
