/* eslint-env node */
'use strict';

var isTesting = process.mainModule.filename.match('qunit');

function ForceSyncRelationshipsPlugin() {
  return {
    visitor: {
      CallExpression(path) {
        /*
          path.node.callee.type -> Identifier
          path.node.callee.name -> belongsTo

        and

          path.node.callee.type -> MemberExpression
          path.node.callee.property.name -> belongsTo
        */
        if (this.file.opts.filename.match('model') || isTesting) {
          let isMemberExpression = path.node.callee.type === 'MemberExpression';
          let isIdentifier = path.node.callee.type === 'Identifier';
          let isHasManyMemberExpression = isMemberExpression && path.node.callee.property.name === 'hasMany';
          let isHasManyIdentifier = isIdentifier && path.node.callee.name === 'hasMany';
          let isHasMany = isHasManyMemberExpression || isHasManyIdentifier;
          let isBelongsToMemberExpression = isMemberExpression && path.node.callee.property.name === 'belongsTo';
          let isBelongsToIdentifier = isIdentifier && path.node.callee.name === 'belongsTo';
          let isBelongsTo = isBelongsToMemberExpression || isBelongsToIdentifier;

          if ((isHasMany || isBelongsTo) && path.parent.type === 'ObjectProperty') {
            let emptyObjectExpression = {
              type: "ObjectExpression",
              properties: []
            };
            let asyncFalseProperty = {
              type: "ObjectProperty",
              method: false,
              shorthand: false,
              key: {
                type: "Identifier",
                loc: {
                  identifierName: "async"
                },
                name: "async"
              },
              computed: false,
              value: {
                type: "BooleanLiteral",
                value: false
              }
            };

            let lastArgument = path.node.arguments.length > 0 && path.node.arguments[path.node.arguments.length - 1];
            let lastArgumentIsOptions = lastArgument.type === 'ObjectExpression';
            let indexOfOptions;

            if (lastArgumentIsOptions) {
              indexOfOptions = path.node.arguments.length - 1;
              let existingAsyncOption = lastArgument.properties.find(prop => prop.key.name === 'async');
              if (existingAsyncOption) {
                /*
                  For now, let's throw for any value async. You can check the value with `existingAsyncOption.value.value`.
                */
                throw path.buildCodeFrameError(`Ember Data Storefront: You've set forceSyncRelationships to "rewrite", so you should omit the async option on all relationships.`);
              } else {
                path.node.arguments[indexOfOptions].properties.push(asyncFalseProperty);
              }

            } else {
              path.node.arguments = path.node.arguments || [];
              path.node.arguments.push(emptyObjectExpression);
              indexOfOptions = path.node.arguments.length - 1;

              path.node.arguments[indexOfOptions].properties.push(asyncFalseProperty);
            }
          }
        }
      }
    }
  }
}

ForceSyncRelationshipsPlugin.baseDir = function() {
  return __dirname;
};

ForceSyncRelationshipsPlugin.cacheKey = function() {
  return 'ember-data-storefront.force-sync-relationships';
};

module.exports = ForceSyncRelationshipsPlugin;
