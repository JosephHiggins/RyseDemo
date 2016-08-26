//
//  InterfaceController.swift
//  ryseDemo Watch Extension
//
//  Created by Joseph Higgins on 8/18/16.
//
//

import WatchKit
import Foundation
import HealthKit
import WatchKit


class InterfaceController: WKInterfaceController, HKWorkoutSessionDelegate {
    let healthStore = HKHealthStore()
    let countPerMinuteUnit = HKUnit(fromString: "count/min")
    let heartRateType = HKObjectType.quantityTypeForIdentifier(HKQuantityTypeIdentifierHeartRate)
    let typesToShare = Set([HKObjectType.workoutType()])
    let typesToRead = Set([
        HKObjectType.quantityTypeForIdentifier(HKQuantityTypeIdentifierHeartRate)!,
        
        ])
    var anchor = HKQueryAnchor(fromValue: Int(HKAnchoredObjectQueryNoAnchor))
    var workoutSession : HKWorkoutSession?
    
    
    var workoutStartDate: NSDate?
    var workoutEndDate: NSDate?
    
    var queries: [HKQuery] = []
    
    var heartRateSampless: [HKQuantitySample] = []
    
    
    
    
    var currentHeartRateSample: HKQuantitySample?
    
    var currentHeartRateQuantity: HKQuantity!
    
    override func awakeWithContext(context: AnyObject?) {
        
      
        
        var activityType: HKWorkoutActivityType?
        var locationType: HKWorkoutSessionLocationType?
        
        
        super.awakeWithContext(context)
        activityType = HKWorkoutActivityType.MindAndBody  
         
         
        locationType = HKWorkoutSessionLocationType.Indoor  
        workoutSession = HKWorkoutSession(activityType: activityType!, locationType: locationType!)  
         
        workoutSession!.delegate = self  
         
        let session = HKWorkoutSession(activityType: .Running, locationType: .Indoor)
        session.delegate = self
        healthStore.startWorkoutSession(session)
         
        
         
        //self.healthStore.requestAuthorizationToShareTypes(typesToShare, readTypes: typesToRead) { (sucess, error) -> Void in

        //)
        createStreamingHeartRateQuery(NSDate())  
        // Configure interface objects here.
    }

    func getHeartRateSamples(samples: [HKSample]?) {  
        guard let heartRateSamples = samples as? [HKQuantitySample] else { return }  
        
         
        for sample in heartRateSamples {  
            print(sample.quantity)  
            print(sample.startDate)  
             
            let heartRate = sample.quantity  
            let heartRateDouble = heartRate.doubleValueForUnit(countPerMinuteUnit)  
             
            print("\(heartRateDouble)")  
             
        }  
    } 

    override func willActivate() {
        // This method is called when watch view controller is about to be visible to user
        super.willActivate()

       
    }

    override func didDeactivate() {
        // This method is called when watch view controller is no longer visible
        super.didDeactivate()
    }
    
    
    @IBAction func activateButtonTapped() {
        // We need to trigger a workout session so that the heart rate monitor starts collecting data every few seconds

        // Now, for the Wormhole for connecting to the Cordova app
        let watchConnectivityListeningWormhole = MMWormholeSession.sharedListeningSession();
        watchConnectivityListeningWormhole.activateSessionListening();
        
        let wormhole = MMWormhole(applicationGroupIdentifier: "group.com.isodevelopers.ryse", optionalDirectory: "wormhole", transitingType: .SessionContext);
        watchConnectivityListeningWormhole.listenForMessageWithIdentifier("coolQueue", listener: { (messageObject) -> Void in
            if let message: AnyObject = messageObject {
                // handle your message here
                NSLog("got a message")
                wormhole.passMessageObject("Gotcha", identifier: "coolQueue")
            }
        })
        NSLog("after")
    }
    
    func workoutSession(workoutSession: HKWorkoutSession, didChangeToState toState: HKWorkoutSessionState, fromState: HKWorkoutSessionState, date: NSDate) {
        
        NSLog("Oh yes")
    }
    
    func workoutSession(workoutSession: HKWorkoutSession, didFailWithError error: NSError) {
        // Do nothing for now
        NSLog("Workout error: \(error.userInfo)")
    }

    func createStreamingHeartRateQuery(workoutStartDate: NSDate) -> Void {
         
         
        let predicate = HKQuery.predicateForSamplesWithStartDate(workoutStartDate, endDate: nil, options: .None)  
        let type = HKObjectType.quantityTypeForIdentifier(HKQuantityTypeIdentifierHeartRate)  

         
        
         
    }  


}
