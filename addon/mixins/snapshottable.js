import { assert } from '@ember/debug';
import { isArray } from '@ember/array';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  /*
    Graph for a post looks like

      {
        author: true,
        comments: {
          author: true
        }
      }

    Call `true` to stop at a leaf, pass an object to keep going.

    Snapshots look like
      {
        relationships: {
          comments: [
            {
              model: MODEL,
              relationships: {
                author: { model: MODEL, relationships: {} }
              }
            }, ...
          ], {
            author: { model: MODEL, relationships: {} }
          }
        }
      }
  */
  takeSnapshot(graph = {}) {
    let snapshot = { model: this, relationships: {} };

    Object.keys(graph).forEach((key) => {
      let node = graph[key];
      let relationship = this.get(key);

      if (isArray(relationship)) {
        snapshot.relationships[key] = relationship.map((model) => ({
          model,
          relationships: {},
        }));
      } else {
        snapshot.relationships[key] = {
          model: relationship,
          relationships: {},
        };
      }

      // call all this recursively instead
      if (typeof node === 'object') {
        Object.keys(node).forEach((subkey) => {
          let namedRelationshipMeta = snapshot.relationships[key];
          if (namedRelationshipMeta) {
            if (isArray(namedRelationshipMeta)) {
              namedRelationshipMeta.forEach((relationshipSnapshot) => {
                let nestedRelationship = relationshipSnapshot.model.get(subkey);

                if (isArray(nestedRelationship)) {
                  relationshipSnapshot.relationships[subkey] =
                    nestedRelationship.map((model) => ({
                      model,
                      relationships: {},
                    }));
                } else {
                  relationshipSnapshot.relationships[subkey] = {
                    model: nestedRelationship,
                    relationships: {},
                  };
                }

                // check the node (would be handled by recursive call)
              });
            } else {
              // Deal with object case
              let nestedRelationship = namedRelationshipMeta.model.get(subkey);

              if (isArray(nestedRelationship)) {
                namedRelationshipMeta.relationships[subkey] =
                  nestedRelationship.map((model) => ({
                    model,
                    relationships: {},
                  }));
              } else {
                namedRelationshipMeta.relationships[subkey] = {
                  model: nestedRelationship,
                  relationships: {},
                };
              }
            }
          }
        });
      }
    });

    return snapshot;
  },

  /*
    Snapshots look like this:

      {
        model: this,
        relationships: {
          comments: [
            {
              model: MODEL,
              relationships: {
                author: { model: MODEL, relationships: {} }
              }
            }, ...
          ], {
            author: { model: MODEL, relationships: {} }
          }
        }
      }

    TODO: For now, calling rollbackAttributes on every model we restore. Silly because
    the attributes are not coming from the snapshot. We should use this.serialize to
    store them in a data structure.
  */
  restoreSnapshot(snapshot) {
    snapshot.model && snapshot.model.rollbackAttributes();

    Object.keys(snapshot.relationships).forEach((key) => {
      let relationshipSnapshot = snapshot.relationships[key];
      if (isArray(relationshipSnapshot)) {
        this.set(
          key,
          relationshipSnapshot.map((meta) => meta.model)
        );
        relationshipSnapshot.forEach((rSnapshot) => {
          let model = rSnapshot.model;
          model.rollbackAttributes();
          if (Object.keys(rSnapshot.relationships).length) {
            assert(
              `You're trying to restore a snapshot on a ${model._debugContainerKey} but that model isn't snapshottable. Be sure to include the Snapshottable mixin.`,
              model.restoreSnapshot !== undefined
            );
            model.restoreSnapshot(rSnapshot);
          }
        });
      } else {
        let { model } = relationshipSnapshot;
        this.set(key, model);

        // Model could be null (reverting to null relationship).
        if (model) {
          model.rollbackAttributes();
        }

        if (Object.keys(relationshipSnapshot.relationships).length) {
          assert(
            `You're trying to restore a snapshot on a ${model._debugContainerKey} but that model isn't snapshottable. Be sure to include the Snapshottable mixin.`,
            model.restoreSnapshot !== undefined
          );
          model.restoreSnapshot(relationshipSnapshot);
        }
      }
    });
  },
});
